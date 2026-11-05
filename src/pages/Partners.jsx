import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import PartnerCard from '@/components/partners/PartnerCard';
import PartnerDialog from '@/components/partners/PartnerDialog';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import usePageMeta from '@/hooks/usePageMeta';

const PARTNER_TYPES = ['notary', 'lawyer', 'appraiser'];

export default function Partners() {
  const { t } = useI18n();
  const [items, setItems] = useState(null);
  const [type, setType] = useState('all');
  const [city, setCity] = useState('all');
  const [requested, setRequested] = useState(null);

  usePageMeta({
    title: t('partners.title'),
    description: t('partners.subtitle'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ReDom', item: `${window.location.origin}/` },
        { '@type': 'ListItem', position: 2, name: t('partners.title'), item: `${window.location.origin}/partners` },
      ],
    },
  });

  useEffect(() => {
    let active = true;
    base44.entities.Partner
      .list({ sort: '-rating', limit: 100 })
      .then((page) => active && setItems(page.items || []))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, []);

  const cities = useMemo(
    () => [...new Set((items || []).map((item) => item.city).filter(Boolean))],
    [items]
  );

  const visible = useMemo(
    () =>
      (items || []).filter(
        (item) => (type === 'all' || item.type === type) && (city === 'all' || item.city === city)
      ),
    [items, type, city]
  );

  return (
    <>
      <PageHeader eyebrow={t('nav.partners')} title={t('partners.title')} subtitle={t('partners.subtitle')} />

      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {['all', ...PARTNER_TYPES].map((value) => {
            const active = value === type;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {value === 'all' ? t('partners.allTypes') : t(`partners.types.${value}`)}
              </button>
            );
          })}
        </div>

        {cities.length > 1 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {['all', ...cities].map((value) => {
              const active = value === city;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCity(value)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    active
                      ? 'border-foreground/30 bg-secondary text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {value === 'all' ? t('common.allCities') : value}
                </button>
              );
            })}
          </div>
        ) : null}

        {items === null ? (
          <Loading />
        ) : visible.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} onRequest={setRequested} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState title={t('partners.empty')} text={t('partners.emptyHint')} />
          </div>
        )}
      </div>

      <PartnerDialog partner={requested} open={Boolean(requested)} onOpenChange={(open) => (open ? null : setRequested(null))} />
    </>
  );
}