import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, Heart, MapPin, Ruler, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Gallery from '@/components/listings/Gallery';
import OwnerCard from '@/components/listings/OwnerCard';
import ListingCard from '@/components/listings/ListingCard';
import InquiryDialog from '@/components/inquiry/InquiryDialog';
import ViewingDialog from '@/components/viewings/ViewingDialog';
import ReportDialog from '@/components/report/ReportDialog';
import OwnerReviews from '@/components/reviews/OwnerReviews';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import useFavorites from '@/hooks/useFavorites';
import { addressLine, fairPrice, roomsLabel } from '@/lib/listings';
import usePageMeta from '@/hooks/usePageMeta';
import { toast } from '@/components/ui/use-toast';

export default function ListingDetail() {
  const { id } = useParams();
  const { t, money, date } = useI18n();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAccount();
  const { isFavorite, toggle } = useFavorites();
  const [listing, setListing] = useState(undefined);
  const [photos, setPhotos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [benchmark, setBenchmark] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [viewingOpen, setViewingOpen] = useState(false);

  usePageMeta({
    title: listing?.title,
    description: listing?.description?.slice(0, 160),
    image: listing?.cover_url,
  });

  useEffect(() => {
    let active = true;
    setListing(undefined);
    base44.entities.Listing.get(id)
      .then((record) => {
        if (!active) return;
        setListing(record || null);
      })
      .catch(() => active && setListing(null));
    base44.functions.invoke('trackView', { listingId: id }).catch(() => {});
    return () => {
      active = false;
    };
  }, [id]);

  const loadRelated = useCallback(async () => {
    if (!listing) return;
    const [mediaPage, similarPage, comparable] = await Promise.all([
      base44.entities.Media.filter({ listing_id: listing.id }, { sort: 'order', limit: 30 }).catch(() => ({ items: [] })),
      base44.entities.Listing.filter(
        { status: 'published', city: listing.city, deal_type: listing.deal_type },
        { sort: '-created_date', limit: 4 }
      ).catch(() => ({ items: [] })),
      base44.entities.Listing.filter(
        { status: 'published', city: listing.city, deal_type: listing.deal_type },
        { limit: 60 }
      ).catch(() => ({ items: [] })),
    ]);
    setPhotos(mediaPage.items || []);
    setSimilar((similarPage.items || []).filter((item) => item.id !== listing.id).slice(0, 3));

    const pool = (comparable.items || []).filter((item) => item.area > 0 && item.price > 0);
    if (pool.length >= 3) {
      const avgPerSqm = pool.reduce((sum, item) => sum + item.price / item.area, 0) / pool.length;
      setBenchmark(avgPerSqm * listing.area);
    }
  }, [listing]);

  useEffect(() => {
    loadRelated();
  }, [loadRelated]);

  const fair = useMemo(() => fairPrice(listing, benchmark), [listing, benchmark]);

  if (listing === undefined) return <Loading className="py-24" />;
  if (listing === null) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <EmptyState
          title={t('listing.notFound')}
          text={t('listing.notFoundHint')}
          actionLabel={t('nav.buy')}
          actionTo="/search?deal=sale"
        />
      </div>
    );
  }

  const isOwner = user?.id === listing.owner_user_id;
  const pricePerSqm = listing.area ? Math.round(listing.price / listing.area) : null;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: t('common.copied') });
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> {t('common.back')}
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <Gallery photos={photos} title={listing.title} />

          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="chip">{t(listing.deal_type === 'rent' ? 'form.dealTypeRent' : 'form.dealTypeSale')}</span>
                <span className="chip">{t(`category.${listing.category}`)}</span>
                {listing.is_verified_owner ? (
                  <span className="chip border-accent/40 text-accent">
                    <BadgeCheck className="h-3.5 w-3.5" /> {t('listing.verified')}
                  </span>
                ) : null}
              </div>
              <h1 className="font-display text-2xl leading-tight sm:text-3xl">{listing.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" strokeWidth={1.6} />
                {[listing.address, listing.district, listing.city].filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl">{money(listing.price, listing.currency || 'RUB')}</p>
              <p className="text-xs text-muted-foreground">
                {listing.deal_type === 'rent' ? t('listing.monthly') : t('listing.totalPrice')}
              </p>
              {pricePerSqm ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {money(pricePerSqm)} {t('units.perSqm')}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-border py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" /> {listing.area} {t('units.sqm')}</span>
            <span>{roomsLabel(t, listing.rooms)}</span>
            {listing.floor ? <span>{t('listing.floorOf', { floor: listing.floor, floors: listing.floors || '—' })}</span> : null}
            {listing.year_built ? <span>{t('listing.yearBuilt')}: {listing.year_built}</span> : null}
            <span>{t('listing.views', { count: listing.views_count || 0 })}</span>
            <div className="ml-auto flex items-center gap-3">
              <button type="button" onClick={share} className="inline-flex items-center gap-1.5 hover:text-foreground">
                <Share2 className="h-3.5 w-3.5" /> {t('listing.share')}
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => toggle(listing)}
                  className="inline-flex items-center gap-1.5 hover:text-foreground"
                >
                  <Heart className={`h-3.5 w-3.5 ${isFavorite(listing.id) ? 'fill-accent text-accent' : ''}`} />
                  {t(isFavorite(listing.id) ? 'listing.inFavorites' : 'listing.favorite')}
                </button>
              ) : null}
            </div>
          </div>

          {fair ? (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="label-xs">{t('listing.priceFair.title')}</p>
                <p className="text-sm">
                  {t(`listing.priceFair.${fair.tone}`, { percent: fair.percent })} · {money(pricePerSqm)} {t('units.perSqm')}
                </p>
              </div>
            </div>
          ) : null}

          <section className="mt-8">
            <h2 className="font-heading text-lg font-semibold">{t('listing.description')}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{listing.description}</p>
          </section>

          {listing.amenities?.length ? (
            <section className="mt-8">
              <h2 className="font-heading text-lg font-semibold">{t('listing.amenities')}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span key={amenity} className="chip">{t(`amenity.${amenity}`, { defaultValue: amenity })}</span>
                ))}
              </div>
            </section>
          ) : null}

          <OwnerReviews ownerUserId={listing.owner_user_id} ownerName={listing.owner_name} isOwner={isOwner} />

          {listing.deal_type === 'rent' ? (
            <section className="mt-8 rounded-2xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold">{t('listing.rentTerms')}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="label-xs">{t('listing.deposit')}</dt>
                  <dd className="mt-1">{listing.deposit ? money(listing.deposit, listing.currency) : '—'}</dd>
                </div>
                <div>
                  <dt className="label-xs">{t('listing.petsAllowed')}</dt>
                  <dd className="mt-1">{listing.pets_allowed ? t('common.yes') : t('common.no')}</dd>
                </div>
                <div>
                  <dt className="label-xs">{t('listing.childrenAllowed')}</dt>
                  <dd className="mt-1">{listing.children_allowed ? t('common.yes') : t('common.no')}</dd>
                </div>
                <div>
                  <dt className="label-xs">{t('listing.utilitiesIncluded')}</dt>
                  <dd className="mt-1">{listing.utilities_included ? t('common.yes') : t('listing.utilitiesSeparate')}</dd>
                </div>
              </dl>
            </section>
          ) : null}

          {listing.video_url ? (
            <section className="mt-8">
              <h2 className="font-heading text-lg font-semibold">{t('listing.video')}</h2>
              <a href={listing.video_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-accent underline">
                {listing.video_url}
              </a>
            </section>
          ) : null}

          {listing.floor_plan_url ? (
            <section className="mt-8">
              <h2 className="font-heading text-lg font-semibold">{t('listing.floorPlan')}</h2>
              <img src={listing.floor_plan_url} alt={t('listing.floorPlan')} className="mt-3 w-full rounded-2xl border border-border object-contain" />
            </section>
          ) : null}

          <section className="mt-8">
            <h2 className="font-heading text-lg font-semibold">{t('listing.location')}</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border">
              <a
                href={`https://yandex.ru/maps/?text=${encodeURIComponent([listing.address, listing.city].filter(Boolean).join(', '))}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-secondary/50 p-4 text-sm transition-colors hover:bg-secondary"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{addressLine(listing)}</span>
                  <span className="text-xs text-muted-foreground">{t('search.map')} · Яндекс Карты</span>
                </span>
              </a>
            </div>
          </section>

          {similar.length ? (
            <section className="mt-10">
              <h2 className="font-display text-2xl">{t('listing.similar')}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((item) => <ListingCard key={item.id} listing={item} />)}
              </div>
            </section>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-4">
            <ReportDialog targetType="listing" targetId={listing.id} targetLabel={listing.title} />
            <span className="text-[11px] text-muted-foreground">
              {listing.updated_date ? t('listing.published', { date: date(listing.updated_date) }) : null}
            </span>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <OwnerCard
            listing={listing}
            isOwner={isOwner}
            onInquiry={() => setInquiryOpen(true)}
            onViewing={() => setViewingOpen(true)}
          />

          <div className="mt-3 rounded-2xl border border-border bg-card p-5">
            <p className="label-xs mb-2">{t('listing.aboutHouse')}</p>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{t(`category.${listing.category}`)} · {listing.city}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>{listing.year_built || '—'} {t('units.yearBuilt')}</span>
            </div>
            {isOwner ? (
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
                <Link to={`/listings/${listing.id}/edit`}>{t('common.edit')}</Link>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>

      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} listing={listing} />
      <ViewingDialog open={viewingOpen} onOpenChange={setViewingOpen} listing={listing} />
    </div>
  );
}