import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ListingCard from '@/components/listings/ListingCard';
import { SkeletonCard } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import useFavorites from '@/hooks/useFavorites';
import { useAccount } from '@/lib/AccountContext';

export default function FeaturedListings() {
  const { t } = useI18n();
  const { isAuthenticated } = useAccount();
  const { isFavorite, toggle } = useFavorites();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.Listing.filter({ status: 'published' }, { sort: '-created_date', limit: 6 })
      .then((page) => {
        if (active) setItems(page.items || page || []);
      })
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-content px-4 py-14 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="label-xs mb-2">{t('home.featured')}</p>
          <h2 className="font-display text-2xl sm:text-3xl">{t('home.featuredSub')}</h2>
        </div>
        <Link to="/search?deal=sale" className="hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
          {t('common.viewAll')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {items === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <SkeletonCard key={key} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={t('search.noResults')} text={t('search.noResultsHint')} actionLabel={t('nav.listProperty')} actionTo="/listings/new" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              favorite={isFavorite(listing.id)}
              onToggleFavorite={isAuthenticated ? toggle : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}