import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { round2 } from '../../shared/rent.ts';

/**
 * Rent payments.
 *   action: 'pay'      — the tenant pays an invoice (demo gateway always approves)
 *   action: 'markPaid' — the owner records a cash / bank-transfer payment
 *
 * Payment records are service-role only (RLS keeps them admin-writable), so the whole
 * settlement runs here after the caller is verified as a party of the invoice.
 */

const METHODS = ['card', 'sbp', 'bank_transfer'];
const receiptNumber = () => String(Math.floor(100000 + Math.random() * 899999));

const serviceFee = async (base44, amount) => {
  const page = await base44.asServiceRole.entities.AppSetting
    .filter({ key: 'fees' }, { limit: 1 })
    .catch(() => ({ items: [] }));
  const percent = Number(page.items?.[0]?.value?.fee_percent ?? 1.5);
  return round2((amount * percent) / 100);
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'pay';
    const invoiceId = body.invoiceId;
    if (!invoiceId) return Response.json({ error: 'invoiceId is required' }, { status: 400 });

    const invoice = await base44.entities.Invoice.get(invoiceId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });

    const total = round2(invoice.total);
    const alreadyPaid = round2(invoice.paid_amount);
    const remaining = round2(total - alreadyPaid);
    if (remaining <= 0) return Response.json({ error: 'Invoice is already paid' }, { status: 400 });

    let amount = remaining;
    let method = 'bank_transfer';
    let payerId = '';
    let payerName = '';
    let note = '';

    if (action === 'pay') {
      if (invoice.tenant_user_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      method = METHODS.includes(body.method) ? body.method : 'card';
      if (body.amount !== undefined && body.amount !== null && body.amount !== '') {
        amount = round2(body.amount);
      }
      if (!(amount > 0)) return Response.json({ error: 'amount must be positive' }, { status: 400 });
      if (amount > remaining + 0.01) return Response.json({ error: 'amount exceeds the remaining total' }, { status: 400 });
      payerId = user.id;
      payerName = body.payerName || user.full_name || user.email || '';
      note = 'online';
    } else if (action === 'markPaid') {
      if (invoice.owner_user_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      payerId = invoice.tenant_user_id || '';
      payerName = invoice.tenant_name || '';
      note = 'owner_marked';
    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    amount = Math.min(amount, remaining);
    const payment = await base44.asServiceRole.entities.Payment.create({
      invoice_id: invoice.id,
      lease_id: invoice.lease_id || '',
      payer_user_id: payerId,
      owner_user_id: invoice.owner_user_id || '',
      amount,
      currency: invoice.currency || 'RUB',
      method,
      status: 'succeeded',
      provider: 'mock',
      provider_ref: `pay_${crypto.randomUUID().slice(0, 12)}`,
      receipt_number: receiptNumber(),
      fee_amount: await serviceFee(base44, amount),
      payer_name: payerName,
      note,
    });

    const paidNow = round2(alreadyPaid + amount);
    const updated = await base44.asServiceRole.entities.Invoice.update(invoice.id, {
      paid_amount: paidNow,
      status: paidNow >= total ? 'paid' : 'partially_paid',
    });

    const recipient = note === 'online' ? invoice.owner_user_id : invoice.tenant_user_id;
    if (recipient) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: recipient,
        type: note === 'online' ? 'rent_paid' : 'rent_payment_recorded',
        title_key: note === 'online' ? 'rent.payNow' : 'invoice.markPaid',
        params: { amount },
        body: `${invoice.number || ''} · ${amount}`,
        link: `/rent/invoices/${invoice.id}`,
        channel: 'inapp',
        is_read: false,
      }).catch(() => null);
    }

    return Response.json({ payment, invoice: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}