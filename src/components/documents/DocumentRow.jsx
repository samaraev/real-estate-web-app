import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useI18n } from '@/i18n';
import StatusPill from '@/components/rent/StatusPill';

export const STATUS_TONE = {
  draft: 'neutral',
  sent: 'blue',
  partially_signed: 'amber',
  signed: 'green',
  declined: 'red',
};

export default function DocumentRow({ doc }) {
  const { t, date } = useI18n();
  return (
    <Link
      to={`/documents/${doc.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <FileText className="h-4 w-4" strokeWidth={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-sm font-semibold">{doc.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {t(`docs.types.${doc.type}`)} · {date(doc.created_date)} · {String(doc.language || 'ru').toUpperCase()}
        </p>
      </div>
      <StatusPill tone={STATUS_TONE[doc.status] || 'neutral'}>{t(`docs.status.${doc.status || 'draft'}`)}</StatusPill>
    </Link>
  );
}