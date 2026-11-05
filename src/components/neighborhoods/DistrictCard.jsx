import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, TrainFront } from 'lucide-react';
import { useI18n } from '@/i18n';
import { districtPath, metroFor } from '@/lib/neighborhoods';

export default function DistrictCard({ city, district, sale, rent }) {
  const { t, money } = useI18n();
  const metro = metroFor(city, district);

  return (
    <Link
      to={districtPath(city.id, district)}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-base font-semibold leading-tight">{district}</h3>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>

      {metro ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <TrainFront className="h-3 w-3 shrink-0" aria-hidden="true" strokeWidth={1.6} />
          {metro}
        </p>
      ) : null}

      <dl className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-baseline justify-between gap-2">
          <dt>{t('neighborhood.saleCount')}</dt>
          <dd className="text-right text-foreground">
            {t('units.listingCount', { count: sale?.count || 0 })}
            {sale?.avg ? <span className="block text-[11px] text-muted-foreground">{money(sale.avg)}</span> : null}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt>{t('neighborhood.rentCount')}</dt>
          <dd className="text-right text-foreground">
            {t('units.listingCount', { count: rent?.count || 0 })}
            {rent?.avg ? <span className="block text-[11px] text-muted-foreground">{money(rent.avg)}</span> : null}
          </dd>
        </div>
      </dl>
    </Link>
  );
}