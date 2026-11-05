import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import DistrictCard from '@/components/neighborhoods/DistrictCard';
import { CITIES } from '@/lib/constants';
import { findCity, loadCityDistricts } from '@/lib/neighborhoods';
import { useI18n } from '@/i18n';
import usePageMeta from '@/hooks/usePageMeta';

export default function Neighborhoods() {
  const { t, locale } = useI18n();
  const [params] = useSearchParams();
  const city = findCity(params.get('city')) || CITIES[0];
  const [stats, setStats] = useState(null);

  usePageMeta({
    title: t('neighborhood.title'),
    description: t('neighborhood.subtitle'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ReDom', item: `${window.location.origin}/` },
        { '@type': 'ListItem', position: 2, name: t('neighborhood.title'), item: `${window.location.origin}/neighborhoods` },
      ],
    },
  });

  useEffect(() => {
    let active = true;
    setStats(null);
    loadCityDistricts(city.name.ru)
      .then((result) => active && setStats(result))
      .catch(() => active && setStats({ saleMap: {}, rentMap: {} }));
    return () => {
      active = false;
    };
  }, [city.id, city.name.ru]);

  return (
    <>
      <PageHeader eyebrow={t('nav.neighborhoods')} title={t('neighborhood.title')} subtitle={t('neighborhood.subtitle')} />

      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label={t('common.city')}>
          {CITIES.map((item) => {
            const active = item.id === city.id;
            return (
              <Link
                key={item.id}
                to={`/neighborhoods?city=${item.id}`}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name[locale] || item.name.ru}
              </Link>
            );
          })}
        </div>

        {stats === null ? (
          <Loading />
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {city.districts.map((district) => (
              <DistrictCard
                key={district}
                city={city}
                district={district}
                sale={stats.saleMap[district]}
                rent={stats.rentMap[district]}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}