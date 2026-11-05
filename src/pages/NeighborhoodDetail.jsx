import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, TrainFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Breadcrumbs from '@/components/neighborhoods/Breadcrumbs';
import ListingCard from '@/components/listings/ListingCard';
import Stat from '@/components/rent/Stat';
import { base44 } from '@/api/base44Client';
import { findCity, loadCityDistricts, metroFor, pricePerSqm, searchPath } from '@/lib/neighborhoods';
import { useI18n } from '@/i18n';
import usePageMeta from '@/hooks/usePageMeta';

export default function NeighborhoodDetail() {
  const { cityId, district } = useParams();
  const { t, money } = useI18n();
  const city = findCity(cityId);
  const known = Boolean(city && district && city.districts.includes(district));

  const [stats, setStats] = useState(null);
  const [items, setItems] = useState(null);

  const cityName = city?.name.ru || '';

  usePageMeta({
    title: known ? `${district}, ${cityName}` : t('neighborhood.notFound'),
    description: known ? t('neighborhood.summary', { district, city: cityName }) : undefined,
    noindex: !known,
    jsonLd: known
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ReDom', item: `${window.location.origin}/` },
            { '@type': 'ListItem', position: 2, name: t('neighborhood.title'), item: `${window.location.origin}/neighborhoods` },
            {
              '@type': 'ListItem',
              position: 3,
              name: district,
              item: `${window.location.origin}/neighborhoods/${city.id}/${encodeURIComponent(district)}`,
            },
          ],
        }
      : undefined,
  });

  useEffect(() => {
    if (known) return undefined;
    const tag = document.createElement('meta');
    tag.name = 'prerender-status-code';
    tag.content = '404';
    document.head.appendChild(tag);
    return () => tag.remove();
  }, [known]);

  useEffect(() => {
    if (!known) return undefined;
    let active = true;
    setStats(null);
    setItems(null);
    Promise.all([
      loadCityDistricts(cityName),
      base44.entities.Listing.filter(
        { status: 'published', city: cityName, district },
        { sort: '-created_date', limit: 9 }
      ),
    ])
      .then(([result, page]) => {
        if (!active) return;
        setStats(result);
        setItems(page.items || []);
      })
      .catch(() => {
        if (!active) return;
        setStats({ saleMap: {}, rentMap: {} });
        setItems([]);
      });
    return () => {
      active = false;
    };
  }, [known, cityName, district]);

  const perSqm = useMemo(() => pricePerSqm(items || []), [items]);

  if (!known) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <EmptyState
          title={t('neighborhood.notFound')}
          actionLabel={t('neighborhood.backToDistricts')}
          actionTo="/neighborhoods"
        />
      </div>
    );
  }

  const sale = stats?.saleMap?.[district] || { count: 0, avg: 0 };
  const rent = stats?.rentMap?.[district] || { count: 0, avg: 0 };
  const metro = metroFor(city, district);
  const others = city.districts.filter((item) => item !== district).slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow={city.name.ru}
        title={district}
        subtitle={t('neighborhood.summary', { district, city: cityName })}
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link to={searchPath(city, district)}>
              {t('neighborhood.allListings')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <Breadcrumbs
          className="mb-5"
          items={[
            { label: t('nav.home'), to: '/' },
            { label: t('neighborhood.title'), to: '/neighborhoods' },
            { label: city.name.ru, to: `/neighborhoods?city=${city.id}` },
            { label: district },
          ]}
        />

        {metro ? (
          <p className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <TrainFront className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.6} />
            {t('neighborhood.metro')}: {metro}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t('neighborhood.saleCount')} value={t('units.listingCount', { count: sale.count })} />
          <Stat label={t('neighborhood.avgPrice')} value={sale.avg ? money(sale.avg) : '—'} />
          <Stat label={t('neighborhood.rentCount')} value={t('units.listingCount', { count: rent.count })} />
          <Stat
            label={t('neighborhood.avgRent')}
            value={rent.avg ? money(rent.avg) : '—'}
            hint={perSqm ? `${t('neighborhood.avgSqm')}: ${money(perSqm)}` : undefined}
          />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="font-display text-xl sm:text-2xl">{t('neighborhood.nearby')}</h2>
            <Link to={searchPath(city, district)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t('neighborhood.allListings')}
            </Link>
          </div>

          {items === null ? (
            <Loading />
          ) : items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t('neighborhood.noListings')}
              text={t('neighborhood.noListingsHint')}
              actionLabel={t('neighborhood.otherDistricts')}
              actionTo={`/neighborhoods?city=${city.id}`}
            />
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 font-display text-lg sm:text-xl">{t('neighborhood.otherDistricts')}</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((item) => (
              <Link
                key={item}
                to={`/neighborhoods/${city.id}/${encodeURIComponent(item)}`}
                className="chip transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {item}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}