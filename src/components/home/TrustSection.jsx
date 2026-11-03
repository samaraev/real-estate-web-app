import React from 'react';
import { BadgeCheck, FileSignature, TrendingUp } from 'lucide-react';
import { useI18n } from '@/i18n';

const ICONS = [BadgeCheck, FileSignature, TrendingUp];

export default function TrustSection() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-content px-4 py-14 sm:px-6">
      <h2 className="font-display text-2xl sm:text-3xl">{t('home.trustTitle')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((index) => {
          const Icon = ICONS[index - 1];
          return (
            <div key={index} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-4 font-heading text-base font-semibold">{t(`home.trust.${index}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`home.trust.${index}.text`)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}