import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, MapPin, Star } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function AgencyCard({ agency }) {
  const { t } = useI18n();
  return (
    <Link
      to={`/agencies/${agency.id}`}
      className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold group-hover:underline">{agency.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {agency.city || t('common.unknown')}
          </p>
        </div>
        {agency.is_verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-accent" /> : null}
      </div>
      {agency.description ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{agency.description}</p>
      ) : null}
      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" /> {agency.listings_count || 0}
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5" /> {agency.rating ? Number(agency.rating).toFixed(1) : '—'}
        </span>
      </div>
    </Link>
  );
}