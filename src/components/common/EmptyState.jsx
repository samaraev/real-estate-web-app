import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo, onAction }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      {Icon ? (
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
      ) : null}
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      {text ? <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p> : null}
      {actionLabel && actionTo ? (
        <Button asChild className="mt-6 rounded-full px-6">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-6 rounded-full px-6">
          {actionLabel}
        </Button>
      ) : null}
      {!actionLabel && !text ? <span className="sr-only">{t('common.noData')}</span> : null}
    </div>
  );
}