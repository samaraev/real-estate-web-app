import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function Breadcrumbs({ items = [], className = '' }) {
  const { t } = useI18n();

  return (
    <nav aria-label={t('a11y.breadcrumb')} className={`text-xs text-muted-foreground ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.to ? (
              <Link to={item.to} className="rounded transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? <ChevronRight className="h-3 w-3" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}