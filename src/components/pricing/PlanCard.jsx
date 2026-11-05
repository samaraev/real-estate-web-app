import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

export default function PlanCard({ planId, price, isCurrent, onChoose, busy }) {
  const { t, money } = useI18n();
  const features = [1, 2, 3].map((index) => t(`pricing.plans.${planId}.feature${index}`));

  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 ${
        isCurrent ? 'border-primary bg-secondary/40' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading text-base font-semibold">{t(`pricing.plans.${planId}.name`)}</p>
        {isCurrent ? <span className="chip text-[10px]">{t('pricing.currentPlan')}</span> : null}
      </div>
      <p className="mt-2 font-display text-2xl">
        {price ? money(price) : t('common.free')}
        <span className="ml-1 font-body text-xs text-muted-foreground">/ {t('pricing.month')}</span>
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-1.5">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> {feature}
          </li>
        ))}
      </ul>
      <Button
        className="mt-4 w-full rounded-full"
        variant={isCurrent ? 'outline' : 'default'}
        disabled={isCurrent || busy}
        onClick={() => onChoose(planId, price)}
      >
        {isCurrent ? t('pricing.current') : t('pricing.choose')}
      </Button>
    </div>
  );
}