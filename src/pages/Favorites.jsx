import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import useFavorites from '@/hooks/useFavorites';

export default function Favorites() {
  const { t, money } = useI18n();
  const { isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const { favorites, loading, toggle } = useFavorites();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    if (!favorites.length) {
      setListings([]);
      return;
    }
    const ids = favorites.map((favorite) => favorite.listing_id);
    base44.entities.Listing.filter({ id: { $in: ids } }, { limit: 100 })
      .then((page) => setListings((page.items || []).filter((item) => item.status !== 'archived')))
      .catch(() => setListings([]));
  }, [favorites, isAuthenticated, navigateToLogin]);

  const priceAtSave = (listingId) => favorites.find((favorite) => favorite.listing_id === listingId)?.price_at_save;

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('nav.favorites')} title={t('favorites.title')} />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        {loading || !isAuthenticated ? (
          <Loading />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={t('favorites.empty')}
            text={t('favorites.emptyHint')}
            actionLabel={t('nav.buy')}
            actionTo="/search?deal=sale"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const before = priceAtSave(listing.id);
              const diff = before && before > listing.price ? before - listing.price : 0;
              return (
                <div key={listing.id} className="space-y-1.5">
                  <ListingCard listing={listing} favorite onToggleFavorite={toggle} />
                  {diff > 0 ? (
                    <p className="px-1 text-xs font-medium text-accent">
                      ↓ {t('favorites.priceDropped', { diff: money(diff, listing.currency) })}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}