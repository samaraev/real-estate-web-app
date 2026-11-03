import React from 'react';
import { useI18n } from '@/i18n';

export default function Loading({ label, className = '' }) {
  const { t } = useI18n();
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground ${className}`}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label || t('common.loading')}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-secondary" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}