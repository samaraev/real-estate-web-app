import React, { useState } from 'react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

export default function HowItWorks() {
  const { t } = useI18n();
  const [audience, setAudience] = useState('owners');

  const steps = [1, 2, 3].map((index) => ({
    title: t(`home.${audience === 'owners' ? 'ownerSteps' : 'tenantSteps'}.${index}.title`),
    text: t(`home.${audience === 'owners' ? 'ownerSteps' : 'tenantSteps'}.${index}.text`),
  }));

  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-content px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-xs mb-2">{t('nav.manage')}</p>
            <h2 className="font-display text-2xl sm:text-3xl">{t('home.howTitle')}</h2>
          </div>
          <div className="inline-flex self-start rounded-full border border-border bg-card p-1">
            {[
              { id: 'owners', label: t('home.forOwners') },
              { id: 'tenants', label: t('home.forTenants') },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAudience(option.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                  audience === option.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-display text-3xl text-accent">0{index + 1}</span>
              <h3 className="mt-3 font-heading text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}