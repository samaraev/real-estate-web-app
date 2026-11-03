import React from 'react';

const TONES = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  neutral: 'bg-secondary text-foreground/70',
};

export default function StatusPill({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${TONES[tone] || TONES.neutral}`}>
      {children}
    </span>
  );
}