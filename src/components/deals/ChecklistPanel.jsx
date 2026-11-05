import React from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '@/i18n';
import { normalizeChecklist } from '@/lib/deals';

export default function ChecklistPanel({ deal, onToggle }) {
  const { t } = useI18n();
  const checklist = normalizeChecklist(deal.checklist);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="font-heading text-sm font-semibold">{t('deals.checklist')}</h2>
      <ul className="mt-3 space-y-1.5">
        {checklist.map((item, index) => (
          <li key={`${item.key}-${index}`}>
            <button
              type="button"
              onClick={() => onToggle(item.key)}
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  item.done ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                }`}
              >
                {item.done ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
              <span className={item.done ? 'text-muted-foreground line-through' : ''}>
                {item.label || t(`docs.checklistItems.${item.key}`)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}