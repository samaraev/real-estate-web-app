import React from 'react';

const VALUE_TONE = {
  default: 'text-foreground',
  positive: 'text-green-700 dark:text-green-400',
  warning: 'text-amber-700 dark:text-amber-400',
  danger: 'text-red-700 dark:text-red-400',
};

export default function Stat({ label, value, hint, tone = 'default' }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
      <p className="label-xs leading-tight">{label}</p>
      <p className={`mt-1 font-heading text-lg font-semibold leading-tight sm:text-xl ${VALUE_TONE[tone] || VALUE_TONE.default}`}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{hint}</p> : null}
    </div>
  );
}