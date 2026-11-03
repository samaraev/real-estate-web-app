import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Heart, MapPin } from 'lucide-react';
import { useI18n } from '@/i18n';
import { addressLine, FALLBACK_PHOTO, roomsLabel } from '@/lib/listings';
import { cn } from '@/lib/utils';

export default function ListingCard({ listing, favorite = false, onToggleFavorite, className }) {
  const { t, money } = useI18n();

  return (
    <article className={cn('group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_18px_50px_-30px_rgba(16,48,42,0.45)]', className)}>
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={listing.cover_url || FALLBACK_PHOTO}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-primary/92 px-2.5 py-1 text-[11px] font-medium text-primary-foreground backdrop-blur">
              {t(listing.deal_type === 'rent' ? 'form.dealTypeRent' : 'form.dealTypeSale')}
            </span>
            {listing.is_verified_owner ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-medium text-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                {t('card.verified')}
              </span>
            ) : null}
            {listing.boost_until && new Date(listing.boost_until) > new Date() ? (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
                TOP
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {onToggleFavorite ? (
        <button
          type="button"
          onClick={() => onToggleFavorite(listing)}
          aria-label={t(favorite ? 'listing.inFavorites' : 'listing.favorite')}
          aria-pressed={favorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition-transform hover:scale-105"
        >
          <Heart className={cn('h-4 w-4', favorite ? 'fill-accent text-accent' : 'text-foreground/70')} strokeWidth={1.8} />
        </button>
      ) : null}

      <Link to={`/listing/${listing.id}`} className="block p-4">
        <p className="flex items-baseline gap-1 font-heading text-lg font-semibold tracking-tight">
          {money(listing.price, listing.currency || 'RUB')}
          {listing.deal_type === 'rent' ? <span className="text-xs font-normal text-muted-foreground">{t('card.perMonth')}</span> : null}
        </p>
        <h3 className="mt-1 line-clamp-1 font-heading text-sm font-medium text-foreground">{listing.title}</h3>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.6} />
          {addressLine(listing) || t('common.unknown')}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/70">
          <span>{roomsLabel(t, listing.rooms)}</span>
          <span className="text-border">·</span>
          <span>{listing.area} {t('units.sqm')}</span>
          {listing.floor ? (
            <>
              <span className="text-border">·</span>
              <span>{t('units.floorN', { count: listing.floor })}</span>
            </>
          ) : null}
        </div>
      </Link>
    </article>
  );
}