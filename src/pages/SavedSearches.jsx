import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Bell, BellOff, Trash2, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import { buildQuery, filtersToParams } from '@/lib/listings';

export default function SavedSearches() {
  const { t } = useI18n();
  const { isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const [items, setItems] = useState(null);
  const [counts, setCounts] = useState({});

  const load = async () => {
    const page = await base44.entities.SavedSearch.filter({}, { sort: '-created_date', limit: 50 });
    const searches = page.items || [];
    setItems(searches);
    const entries = await Promise.all(
      searches.map((search) =>
        base44.entities.Listing.count(buildQuery(search.filters || {}))
          .then((count) => [search.id, count])
          .catch(() => [search.id, 0])
      )
    );
    setCounts(Object.fromEntries(entries));
  };

  useEffect(() => {
    if (isAuthenticated) load();
    else navigateToLogin();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAlerts = async (search, enabled) => {
    await base44.entities.SavedSearch.update(search.id, { alerts_enabled: enabled });
    load();
  };

  const remove = async (search) => {
    await base44.entities.SavedSearch.delete(search.id);
    load();
  };

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('nav.savedSearches')} title={t('saved.title')} />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        {items === null ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title={t('saved.empty')}
            text={t('saved.emptyHint')}
            actionLabel={t('common.search')}
            actionTo="/search?deal=rent"
          />
        ) : (
          <ul className="space-y-3">
            {items.map((search) => {
              const query = filtersToParams(search.filters || {}).toString();
              return (
                <li key={search.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold">{search.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('saved.newMatches', { count: counts[search.id] || 0 })}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    {search.alerts_enabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                    {t('saved.alerts')}
                    <Switch checked={Boolean(search.alerts_enabled)} onCheckedChange={(checked) => toggleAlerts(search, checked)} />
                  </label>
                  <div className="flex gap-1.5">
                    <Button asChild size="sm" className="rounded-full">
                      <Link to={`/search?${query}`}>
                        {t('common.open')}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => remove(search)} aria-label={t('saved.delete')}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}