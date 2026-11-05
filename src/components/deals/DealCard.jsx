import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import StatusPill from '@/components/rent/StatusPill';
import { dealTitle, progressOf } from '@/lib/deals';

const TONE = {
  inquiry: 'neutral',
  viewing: 'blue',
  offer: 'amber',
  deposit: 'purple',
  documents: 'blue',
  closing: 'amber',
  won: 'green',
  lost: 'red',
};

export default function DealCard({ deal, dragging = false }) {
  const { t, money, date } = useI18n();
  const { done, total } = progressOf(deal);

  return (
    <Link
      to={`/deals/${deal.id}`}
      className={`block rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md ${
        dragging ? 'shadow-lg ring-2 ring-ring' : 'shadow-sm'
      }`}
    >
      <p className="line-clamp-2 font-heading text-sm font-semibold leading-snug">{dealTitle(deal)}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{deal.buyer_name || '—'}</p>
      <p className="mt-2 font-heading text-sm font-semibold">{money(deal.amount, deal.currency || 'RUB')}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusPill tone={TONE[deal.stage] || 'neutral'}>{t(`deals.stages.${deal.stage || 'inquiry'}`)}</StatusPill>
        <span className="text-[11px] text-muted-foreground">{t('deals.progress', { done, total })}</span>
      </div>
      {deal.next_follow_up ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {t('deals.followUpShort')}: {date(deal.next_follow_up)}
        </p>
      ) : null}
    </Link>
  );
}