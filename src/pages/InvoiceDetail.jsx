import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BellRing, CheckCircle2, Printer, XCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';
import StatusPill from '@/components/rent/StatusPill';
import PayDialog from '@/components/rent/PayDialog';
import { displayInvoiceStatus, invoiceTone, METHOD_KEYS, paidAmount, periodToDate, remainingAmount } from '@/lib/rent';

const KINDS = ['rent', 'utilities', 'extra', 'deposit', 'late_fee'];

export default function InvoiceDetail() {
  const { t, money, date, monthLabel, dateTime } = useI18n();
  const { id } = useParams();
  const { user } = useAccount();

  const [invoice, setInvoice] = useState(undefined);
  const [payments, setPayments] = useState([]);
  const [lease, setLease] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const record = await base44.entities.Invoice
      .get(id)
      .catch((error) => (error.status === 404 || error.status === 403 ? null : Promise.reject(error)));
    setInvoice(record);
    if (!record) return;

    const [paymentPage, leaseRecord] = await Promise.all([
      base44.entities.Payment.filter({ invoice_id: id }, { sort: '-created_date', limit: 50 }),
      record.lease_id
        ? base44.entities.Lease.get(record.lease_id).catch(() => null)
        : Promise.resolve(null),
    ]);
    setPayments(paymentPage.items || []);
    setLease(leaseRecord);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (invoice !== null) return undefined;
    const tag = document.createElement('meta');
    tag.name = 'prerender-status-code';
    tag.content = '404';
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, [invoice]);

  const isOwner = Boolean(invoice && user?.id && invoice.owner_user_id === user.id);
  const isTenant = Boolean(invoice && user?.id && invoice.tenant_user_id === user.id);
  const remaining = remainingAmount(invoice);

  const markPaid = async () => {
    setBusy(true);
    try {
      await base44.functions.invoke('rentPayments', { action: 'markPaid', invoiceId: invoice.id });
      toast({ title: t('payment.success') });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remind = async () => {
    setBusy(true);
    try {
      await base44.functions.invoke('rentInvoices', { action: 'remind', invoiceId: invoice.id });
      toast({ title: t('invoice.reminderSent') });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const cancelInvoice = async () => {
    await base44.entities.Invoice.update(invoice.id, { status: 'cancelled' });
    toast({ title: t('common.saved') });
    await load();
  };

  if (invoice === undefined) {
    return <div className="mx-auto max-w-content px-4 py-10"><Loading /></div>;
  }

  if (invoice === null) {
    return (
      <div className="mx-auto max-w-content px-4 py-10">
        <EmptyState icon={XCircle} title={t('invoice.title')} actionLabel={t('rent.invoices')} actionTo="/rent?tab=invoices" />
      </div>
    );
  }

  const status = displayInvoiceStatus(invoice);
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const itemLabel = (title) => (KINDS.includes(title) ? t(`invoice.kind.${title}`) : title);

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={t('invoice.title')}
        title={t('invoice.number', { number: invoice.number || '—' })}
        subtitle={[invoice.period ? monthLabel(periodToDate(invoice.period)) : '', lease?.property_title].filter(Boolean).join(' · ')}
        actions={<StatusPill tone={invoiceTone[status]}>{t(`invoice.status.${status}`)}</StatusPill>}
      />

      <div className="mx-auto w-full max-w-content space-y-5 px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to={lease ? `/rent/leases/${lease.id}` : '/rent?tab=invoices'}>
              <ArrowLeft className="mr-1 h-4 w-4" />{t('common.back')}
            </Link>
          </Button>
          {isTenant && remaining > 0 ? (
            <Button size="sm" className="rounded-full" onClick={() => setPayOpen(true)}>
              {t('rent.payNow')}
            </Button>
          ) : null}
          {isOwner && remaining > 0 ? (
            <>
              <Button size="sm" className="rounded-full" onClick={markPaid} disabled={busy}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{t('invoice.markPaid')}
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={remind} disabled={busy}>
                <BellRing className="mr-1 h-3.5 w-3.5" />{t('invoice.remind')}
              </Button>
            </>
          ) : null}
          {isOwner && !['paid', 'cancelled', 'refunded'].includes(invoice.status) ? (
            <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={cancelInvoice}>
              {t('invoice.cancel')}
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => window.print()}>
            <Printer className="mr-1 h-3.5 w-3.5" />{t('common.print')}
          </Button>
        </div>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="label-xs">{t('invoice.period')}</p>
              <p className="mt-0.5 text-sm">{invoice.period ? monthLabel(periodToDate(invoice.period)) : '—'}</p>
            </div>
            <div>
              <p className="label-xs">{t('invoice.issued')}</p>
              <p className="mt-0.5 text-sm">{date(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="label-xs">{t('invoice.due')}</p>
              <p className="mt-0.5 text-sm">{date(invoice.due_date)}</p>
            </div>
            <div>
              <p className="label-xs">{t('invoice.tenant')}</p>
              <p className="mt-0.5 text-sm">{invoice.tenant_name || '—'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 font-heading text-sm font-semibold">{t('invoice.items')}</h2>
          <ul className="divide-y divide-border">
            {items.map((item, index) => (
              <li key={`item-${index}`} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{itemLabel(item.title)}</span>
                <span className="font-medium">{money(item.sum ?? item.price, invoice.currency)}</span>
              </li>
            ))}
            {!items.length ? <li className="py-2 text-sm text-muted-foreground">{t('common.noData')}</li> : null}
          </ul>

          <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('invoice.total')}</dt>
              <dd className="font-semibold">{money(invoice.total, invoice.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('invoice.paid')}</dt>
              <dd>{money(paidAmount(invoice), invoice.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('invoice.remaining')}</dt>
              <dd className="font-semibold">{money(remaining, invoice.currency)}</dd>
            </div>
          </dl>

          {invoice.note ? <p className="mt-3 text-xs text-muted-foreground">{invoice.note}</p> : null}
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-semibold">{t('payment.history')}</h2>
          {payments.length ? (
            <ul className="space-y-2">
              {payments.map((payment) => (
                <li key={payment.id} className="rounded-2xl border border-border bg-card p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{money(payment.amount, payment.currency)}</span>
                    <span className="text-[11px] text-muted-foreground">{payment.created_date ? dateTime(payment.created_date) : ''}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(METHOD_KEYS[payment.method] || 'payment.card')}
                    {payment.receipt_number ? ` · ${t('payment.receiptNumber', { number: payment.receipt_number })}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              {t('payment.empty')}
            </p>
          )}
        </section>
      </div>

      <PayDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        invoice={invoice}
        onPaid={load}
      />
    </div>
  );
}