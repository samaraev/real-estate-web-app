import React from 'react';
import { useI18n, LOCALES } from '@/i18n';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ className }) {
  const { locale, setLocale } = useI18n();
  return (
    <div className={cn('inline-flex items-center rounded-full border border-border bg-card p-0.5', className)}>
      {Object.entries(LOCALES).map(([code, meta]) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          aria-label={meta.name}
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors',
            locale === code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {meta.label}
        </button>
      ))}
    </div>
  );
}