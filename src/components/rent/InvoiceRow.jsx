import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import StatusPill from './StatusPill';
import { displayInvoiceStatus, invoiceTone, periodToDate, remainingAmount } from '@/lib/rent';

export default function InvoiceRow({ invoice, side = 'owner', onPay }) {
  const { t, money, date, monthLabel } = useI18n();
  const status = displayInvoiceStatus(invoice);
  const remaining = remainingAmount(invoice);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={invoiceTone[status]}>{t(`invoice.status.${status}`)}</StatusPill>
          <Link to={`/rent/invoices/${invoice.id}`} className="truncate text-sm font-medium hover:underline">
            {t('invoice.number', { number: invoice.number || '—' })}
          </Link>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {invoice.period ? monthLabel(periodToDate(invoice.period)) : '—'} · {t('invoice.due')} {date(invoice.due_date)}
          {side === 'owner' && invoice.tenant_name ? ` · ${invoice.tenant_name}` : ''}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold">{money(invoice.total, invoice.currency)}</p>
        {remaining > 0 ? (
          <p className="text-[11px] text-muted-foreground">{t('invoice.remaining')}: {money(remaining, invoice.currency)}</p>
        ) : (
          <p className="text-[11px] text-green-700 dark:text-green-300">{t('invoice.paid')}</p>
        )}
      </div>

      {side === 'tenant' && remaining > 0 && onPay ? (
        <Button size="sm" className="rounded-full" onClick={() => onPay(invoice)}>
          {t('rent.payNow')}
        </Button>
      ) : null}
    </div>
  );
}