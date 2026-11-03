import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Gauge, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { remainingAmount } from '@/lib/rent';
import LeaseCard from './LeaseCard';
import Stat from './Stat';

export default function TenantDashboard({ leases = [], invoices = [], readings = [], requests = [], onPay, onAddReading, onAddRequest }) {
  const { t, money, date, monthLabel } = useI18n();

  const dueInvoice = useMemo(() => invoices
    .filter((invoice) => remainingAmount(invoice) > 0 && invoice.status !== 'cancelled')
    .sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0))[0], [invoices]);

  const openRequests = requests.filter((request) => !['done', 'cancelled'].includes(request.status)).length;
  const pendingReadings = readings.filter((reading) => reading.status === 'submitted').length;
  const paidThisMonth = invoices.filter((invoice) => invoice.status === 'paid').length;

  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 font-heading text-sm font-semibold">{t('rent.yourLease')}</h2>
        {leases.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {leases.map((lease) => <LeaseCard key={lease.id} lease={lease} side="tenant" />)}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            {t('rent.tenantEmptyHint')}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-heading text-sm font-semibold">{t('rent.nextPayment')}</h2>
        {dueInvoice ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {dueInvoice.period ? monthLabel(new Date(`${dueInvoice.period}-01T00:00:00`)) : t('invoice.title')}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('invoice.due')} {date(dueInvoice.due_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-xl font-semibold">{money(remainingAmount(dueInvoice), dueInvoice.currency)}</p>
                <Link to={`/rent/invoices/${dueInvoice.id}`} className="text-[11px] text-muted-foreground hover:text-foreground">
                  {t('invoice.number', { number: dueInvoice.number || '—' })}
                </Link>
              </div>
            </div>
            <Button className="mt-3 w-full rounded-full sm:w-auto" onClick={() => onPay(dueInvoice)}>
              {t('rent.payNow')}
            </Button>
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-5 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />{t('rent.allPaid')}
          </p>
        )}
      </section>

      <div className="grid grid-cols-3 gap-2">
        <Stat label={t('rent.payments')} value={paidThisMonth} hint={t('invoice.status.paid')} />
        <Stat label={t('rent.openRequests')} value={openRequests} tone={openRequests ? 'warning' : 'default'} />
        <Stat label={t('rent.readings')} value={pendingReadings} hint={t('meter.status.submitted')} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-full" onClick={onAddReading} disabled={!leases.length}>
          <Gauge className="mr-1.5 h-4 w-4" />{t('meter.add')}
        </Button>
        <Button variant="outline" className="rounded-full" onClick={onAddRequest} disabled={!leases.length}>
          <Wrench className="mr-1.5 h-4 w-4" />{t('maintenance.new')}
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/rent?tab=invoices"><Plus className="mr-1.5 h-4 w-4" />{t('rent.invoices')}</Link>
        </Button>
      </div>
    </div>
  );
}