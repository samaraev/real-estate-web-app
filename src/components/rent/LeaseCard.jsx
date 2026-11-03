import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { useI18n } from '@/i18n';
import StatusPill from './StatusPill';
import { leaseTone } from '@/lib/rent';

export default function LeaseCard({ lease, side = 'owner' }) {
  const { t, money, date } = useI18n();
  const place = [lease.city, lease.address].filter(Boolean).join(', ');

  return (
    <Link
      to={`/rent/leases/${lease.id}`}
      className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusPill tone={leaseTone[lease.status]}>{t(`lease.status.${lease.status}`)}</StatusPill>
        <span className="text-[11px] text-muted-foreground">
          {date(lease.start_date)} — {date(lease.end_date)}
        </span>
      </div>

      <p className="mt-2 truncate font-heading text-base font-semibold">
        {lease.property_title || lease.address || t('lease.title')}
      </p>
      {place ? (
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />{place}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold">{money(lease.rent_amount, lease.currency)}</span>
        <span className="text-xs text-muted-foreground">{t('units.perMonth')}</span>
        {side === 'owner' && lease.tenant_name ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />{lease.tenant_name}
          </span>
        ) : null}
      </div>
    </Link>
  );
}