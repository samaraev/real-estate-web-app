import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAccount } from '@/lib/AccountContext';

export default function useFavorites() {
  const { user, isAuthenticated } = useAccount();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const items = await base44.entities.Favorite.filter({}, { sort: '-created_date', limit: 200 });
      setFavorites(Array.isArray(items) ? items : items.items || []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = useCallback(
    (listingId) => favorites.some((favorite) => favorite.listing_id === listingId),
    [favorites]
  );

  const toggle = useCallback(
    async (listing) => {
      if (!isAuthenticated) return false;
      const existing = favorites.find((favorite) => favorite.listing_id === listing.id);
      if (existing) {
        await base44.entities.Favorite.delete(existing.id);
        setFavorites((prev) => prev.filter((favorite) => favorite.id !== existing.id));
        return false;
      }
      const created = await base44.entities.Favorite.create({
        listing_id: listing.id,
        price_at_save: listing.price,
      });
      setFavorites((prev) => [created, ...prev]);
      return true;
    },
    [favorites, isAuthenticated]
  );

  return { favorites, loading, isFavorite, toggle, reload: load };
}