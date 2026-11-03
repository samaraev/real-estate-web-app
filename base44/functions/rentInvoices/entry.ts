import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildInvoicePayload, currentPeriod, round2 } from '../../shared/rent.ts';

/**
 * Rent invoicing.
 *   action: 'generate'    — one invoice for one lease and period (owner or admin)
 *   action: 'generateAll' — invoices for every active lease of the caller (or all, for admins)
 *   action: 'remind'      — payment reminder to the tenant
 * Invoices are written with the service role because the owner is the caller but the
 * tenant must be able to read the result and admins own the write rule.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'generate';
    const period = body.period || currentPeriod();
    if (!/^\d{4}-\d{2}$/.test(period)) {
      return Response.json({ error: 'period must be YYYY-MM' }, { status: 400 });
    }

    const notify = async (userId, type, link, text) => {
      if (!userId) return;
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type,
        title_key: type,
        params: {},
        body: text || '',
        link: link || '',
        channel: 'inapp',
        is_read: false,
      }).catch(() => null);
    };

    const utilitiesByLease = async (leases) => {
      const billable = leases.filter((lease) => lease.utilities_rule && lease.utilities_rule !== 'included');
      const result = new Map();
      if (!billable.length) return result;

      const readings = await base44.entities.MeterReading
        .filter({ lease_id: { $in: billable.map((lease) => lease.id) }, period, status: 'approved' }, { limit: 200 })
        .then((page) => page.items || [])
        .catch(() => []);

      billable.forEach((lease) => {
        const sum = round2(readings
          .filter((reading) => reading.lease_id === lease.id)
          .reduce((acc, reading) => acc + Number(reading.cost || 0), 0));
        const capped = lease.utilities_rule === 'capped' && Number(lease.utilities_cap) > 0
          ? Math.min(sum, Number(lease.utilities_cap))
          : sum;
        result.set(lease.id, round2(capped));
      });
      return result;
    };

    if (action === 'generate') {
      const leaseId = body.leaseId;
      if (!leaseId) return Response.json({ error: 'leaseId is required' }, { status: 400 });

      const lease = await base44.entities.Lease.get(leaseId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!lease) return Response.json({ error: 'Lease not found' }, { status: 404 });
      if (lease.owner_user_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const existing = await base44.entities.Invoice.filter({ lease_id: leaseId, period }, { limit: 1 });
      if (existing.items && existing.items.length) {
        return Response.json({ exists: true, invoice: existing.items[0] });
      }

      const utilities = (await utilitiesByLease([lease])).get(lease.id) || 0;
      const invoice = await base44.asServiceRole.entities.Invoice.create(buildInvoicePayload(lease, period, utilities));
      await notify(invoice.tenant_user_id, 'invoice_issued', `/rent/invoices/${invoice.id}`, invoice.number);

      return Response.json({ invoice });
    }

    if (action === 'generateAll') {
      const query = user.role === 'admin'
        ? { status: { $in: ['active', 'expiring'] } }
        : { owner_user_id: user.id, status: { $in: ['active', 'expiring'] } };
      const leasesPage = await base44.entities.Lease.filter(query, { limit: 100 });
      const leases = leasesPage.items || [];
      if (!leases.length) return Response.json({ created: 0, period });

      const existing = await base44.entities.Invoice
        .filter({ lease_id: { $in: leases.map((lease) => lease.id) }, period }, { limit: 200 })
        .then((page) => page.items || [])
        .catch(() => []);
      const done = new Set(existing.map((invoice) => invoice.lease_id));
      const pending = leases.filter((lease) => !done.has(lease.id));
      if (!pending.length) return Response.json({ created: 0, period });

      const utilities = await utilitiesByLease(pending);
      const created = await base44.asServiceRole.entities.Invoice.bulkCreate(
        pending.map((lease) => buildInvoicePayload(lease, period, utilities.get(lease.id) || 0))
      );
      await Promise.allSettled((created || []).map((invoice) =>
        notify(invoice.tenant_user_id, 'invoice_issued', `/rent/invoices/${invoice.id}`, invoice.number)
      ));

      return Response.json({ created: (created || []).length, period });
    }

    if (action === 'remind') {
      const invoiceId = body.invoiceId;
      if (!invoiceId) return Response.json({ error: 'invoiceId is required' }, { status: 400 });

      const invoice = await base44.entities.Invoice.get(invoiceId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
      if (invoice.owner_user_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (invoice.status === 'paid' || invoice.status === 'cancelled') {
        return Response.json({ sent: false });
      }

      const history = Array.isArray(invoice.reminders_sent) ? invoice.reminders_sent : [];
      await base44.asServiceRole.entities.Invoice.update(invoice.id, {
        reminders_sent: [...history, new Date().toISOString()],
      });
      await notify(invoice.tenant_user_id, 'invoice_reminder', `/rent/invoices/${invoice.id}`, invoice.number);

      return Response.json({ sent: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}