import React, { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import HeroSearch from '@/components/home/HeroSearch';
import FeaturedListings from '@/components/home/FeaturedListings';
import HowItWorks from '@/components/home/HowItWorks';
import CitiesGrid from '@/components/home/CitiesGrid';
import TrustSection from '@/components/home/TrustSection';
import CtaBanner from '@/components/home/CtaBanner';
import { base44 } from '@/api/base44Client';
import usePageMeta from '@/hooks/usePageMeta';

export default function Home() {
  const { t } = useI18n();
  const [total, setTotal] = useState(null);

  usePageMeta({
    title: t('nav.home'),
    description: t('home.subtitle'),
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ReDom',
      url: `${window.location.origin}/`,
      inLanguage: 'ru-RU',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/search?keyword={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  });

  useEffect(() => {
    let active = true;
    base44.entities.Listing.count({ status: 'published' })
      .then((count) => active && setTotal(count))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_85%_0%,hsl(var(--secondary))_0%,transparent_55%)]" />
        <div className="relative mx-auto grid w-full max-w-content gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-20">
          <div>
            <p className="label-xs">{t('home.badge')}</p>
            <h1 className="mt-4 max-w-xl font-display text-[32px] leading-[1.12] tracking-tight sm:text-[46px] lg:text-[54px]">
              {t('home.title')}
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">{t('home.subtitle')}</p>
            <div className="mt-7 max-w-xl">
              <HeroSearch />
            </div>
            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="label-xs">{t('home.featured')}</dt>
                <dd className="mt-1 font-heading text-lg font-semibold">
                  {total === null ? '—' : t('units.listingCount', { count: total })}
                </dd>
              </div>
              <div>
                <dt className="label-xs">{t('home.citiesTitle')}</dt>
                <dd className="mt-1 font-heading text-lg font-semibold">4</dd>
              </div>
              <div>
                <dt className="label-xs">{t('nav.manage')}</dt>
                <dd className="mt-1 font-heading text-lg font-semibold">0%</dd>
              </div>
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-3xl border border-border">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=75"
                alt=""
                className="h-[460px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-56 rounded-2xl border border-border bg-card p-4 shadow-lg">
              <p className="label-xs">{t('rent.income')}</p>
              <p className="mt-1 font-display text-2xl">₽ 85 000</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('rent.allPaid')}</p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedListings />
      <HowItWorks />
      <CitiesGrid />
      <TrustSection />
      <CtaBanner />
    </div>
  );
}