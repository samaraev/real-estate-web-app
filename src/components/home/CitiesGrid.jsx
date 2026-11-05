import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CITIES } from '@/lib/constants';
import { useI18n } from '@/i18n';

export default function CitiesGrid() {
  const { t, money, locale } = useI18n();
  const [stats, setStats] = useState({});

  useEffect(() => {
    let active = true;
    Promise.all([
      base44.entities.Listing.aggregate({ query: { status: 'published', deal_type: 'sale' }, groupBy: 'city', avg: ['price'] }),
      base44.entities.Listing.aggregate({ query: { status: 'published', deal_type: 'rent' }, groupBy: 'city', avg: ['price'] }),
    ])
      .then(([sale, rent]) => {
        if (!active) return;
        const next = {};
        (sale?.rows || []).forEach((row) => {
          next[row.city] = { ...(next[row.city] || {}), saleAvg: row.avg_price, saleCount: row.count };
        });
        (rent?.rows || []).forEach((row) => {
          next[row.city] = { ...(next[row.city] || {}), rentAvg: row.avg_price, rentCount: row.count };
        });
        setStats(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-content px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-xs mb-2">{t('home.citiesTitle')}</p>
          <h2 className="font-display text-2xl sm:text-3xl">{t('home.citiesSub')}</h2>
        </div>
        <Link to="/neighborhoods" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          {t('neighborhood.browseAll')}
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CITIES.map((city) => {
          const stat = stats[city.name.ru] || {};
          return (
            <Link
              key={city.id}
              to={`/search?deal=sale&city=${encodeURIComponent(city.name.ru)}`}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-heading text-base font-semibold">{city.name[locale] || city.name.ru}</h3>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <dl className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <dt>{t('neighborhood.avgPrice')}</dt>
                  <dd className="font-medium text-foreground">{stat.saleAvg ? money(stat.saleAvg) : '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>{t('neighborhood.avgRent')}</dt>
                  <dd className="font-medium text-foreground">{stat.rentAvg ? money(stat.rentAvg) : '—'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>{t('neighborhood.listings')}</dt>
                  <dd className="text-foreground">{t('units.listingCount', { count: (stat.saleCount || 0) + (stat.rentCount || 0) })}</dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </div>
    </section>
  );
}