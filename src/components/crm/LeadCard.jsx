import React from 'react';
import { CalendarClock, Phone } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function LeadCard({ lead, dragging, onOpen }) {
  const { t, money, date } = useI18n();

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-xl border border-border bg-card p-3 text-left transition-shadow ${
        dragging ? 'shadow-lg' : ''
      } hover:border-primary/40`}
    >
      <p className="truncate font-heading text-sm font-semibold">{lead.name}</p>
      {lead.phone ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" /> {lead.phone}
        </p>
      ) : null}
      {lead.budget ? <p className="mt-1 text-sm">{money(lead.budget)}</p> : null}
      {lead.next_follow_up ? (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <CalendarClock className="h-3 w-3" /> {t('crm.followUp')}: {date(lead.next_follow_up)}
        </p>
      ) : null}
    </button>
  );
}