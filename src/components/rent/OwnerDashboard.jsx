import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, FilePlus2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { currentPeriod, isOverdue, monthKey, remainingAmount } from '@/lib/rent';
import LeaseCard from './LeaseCard';
import InvoiceRow from './InvoiceRow';
import Stat from './Stat';

export default function OwnerDashboard({ leases = [], invoices = [], payments = [], onCreateLease, onGenerate, generating }) {
  const { t, money } = useI18n();
  const period = currentPeriod();

  const stats = useMemo(() => {
    const activeLeases = leases.filter((lease) => ['active', 'expiring'].includes(lease.status));
    const expected = invoices
      .filter((invoice) => invoice.period === period && invoice.status !== 'cancelled')
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const collected = payments
      .filter((payment) => payment.status === 'succeeded' && monthKey(payment.created_date) === period)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const overdue = invoices.filter(isOverdue);
    return {
      activeCount: activeLeases.length,
      expected,
      collected,
      overdueSum: overdue.reduce((sum, invoice) => sum + remainingAmount(invoice), 0),
      overdue,
    };
  }, [leases, invoices, payments, period]);

  const upcoming = useMemo(() => invoices
    .filter((invoice) => remainingAmount(invoice) > 0 && invoice.status !== 'cancelled')
    .sort((a, b) => new Date(a.due_date || 0) - new Date(b.due_date || 0))
    .slice(0, 4), [invoices]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t('rent.activeLeases')} value={stats.activeCount} />
        <Stat label={t('rent.expected')} value={money(stats.expected)} hint={t('rent.thisMonth')} />
        <Stat label={t('rent.collect')} value={money(stats.collected)} tone="positive" hint={t('rent.thisMonth')} />
        <Stat label={t('rent.overdueSum')} value={money(stats.overdueSum)} tone={stats.overdueSum > 0 ? 'danger' : 'default'} hint={t('rent.overdue')} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button className="rounded-full" onClick={onCreateLease}>
          <Plus className="mr-1.5 h-4 w-4" />{t('rent.createLease')}
        </Button>
        <Button variant="outline" className="rounded-full" onClick={onGenerate} disabled={generating}>
          <FilePlus2 className="mr-1.5 h-4 w-4" />
          {generating ? t('common.processing') : t('rent.generateNow')}
        </Button>
      </div>

      {stats.overdue.length ? (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-destructive">{t('rent.overdue')}</h2>
            <Link to="/rent?tab=invoices" className="text-xs text-muted-foreground hover:text-foreground">{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-2">
            {stats.overdue.slice(0, 3).map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} side="owner" />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">{t('rent.upcomingPayments')}</h2>
          <Link to="/rent?tab=invoices" className="text-xs text-muted-foreground hover:text-foreground">{t('common.viewAll')}</Link>
        </div>
        {upcoming.length ? (
          <div className="space-y-2">
            {upcoming.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} side="owner" />
            ))}
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" />{t('rent.nothingDue')}
          </p>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">{t('rent.leases')}</h2>
          <Link to="/rent?tab=leases" className="text-xs text-muted-foreground hover:text-foreground">{t('common.viewAll')}</Link>
        </div>
        {leases.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {leases.slice(0, 4).map((lease) => (
              <LeaseCard key={lease.id} lease={lease} side="owner" />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            {t('rent.noLeases')} {t('rent.noLeasesHint')}
          </p>
        )}
      </section>
    </div>
  );
}