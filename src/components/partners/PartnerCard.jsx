import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';

export default function PartnerCard({ partner, onRequest }) {
  const { t, money } = useI18n();

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-xs">{t(`partners.types.${partner.type}`)}</p>
          <h3 className="mt-1 font-heading text-base font-semibold leading-tight">{partner.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" strokeWidth={1.6} />
            {[partner.city, partner.address].filter(Boolean).join(', ')}
          </p>
        </div>
        {partner.verification ? (
          <Badge
            variant="secondary"
            className="max-w-[45%] shrink-0 truncate rounded-full text-[10px]"
            title={partner.verification}
          >
            {partner.verification}
          </Badge>
        ) : null}
      </div>

      {partner.description ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{partner.description}</p>
      ) : null}

      <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {partner.rating ? (
          <div className="flex items-center gap-1">
            <dt className="sr-only">{t('reviews.ratingLabel')}</dt>
            <dd className="font-medium text-foreground">★ {Number(partner.rating).toFixed(1)}</dd>
          </div>
        ) : null}
        {partner.price_from ? (
          <div>
            <dt className="sr-only">{t('partners.title')}</dt>
            <dd className="font-medium text-foreground">{t('partners.priceFrom', { price: money(partner.price_from) })}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button size="sm" className="rounded-full" onClick={() => onRequest(partner)}>
          {t('partners.book')}
        </Button>
        {partner.phone ? (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <a href={`tel:${partner.phone}`} aria-label={`${t('common.phone')}: ${partner.phone}`}>
              <Phone className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {partner.phone}
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}