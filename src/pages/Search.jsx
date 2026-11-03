import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bookmark, List, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FilterPanel from '@/components/search/FilterPanel';
import SearchMap from '@/components/search/SearchMap';
import SaveSearchDialog from '@/components/search/SaveSearchDialog';
import ListingCard from '@/components/listings/ListingCard';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonCard } from '@/components/common/Loading';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import useFavorites from '@/hooks/useFavorites';
import { useAccount } from '@/lib/AccountContext';
import { buildQuery, filtersToParams, paramsToFilters, searchListings } from '@/lib/listings';
import usePageMeta from '@/hooks/usePageMeta';

export default function Search() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAccount();
  const { isFavorite, toggle } = useFavorites();

  const filters = useMemo(() => paramsToFilters(params), [params]);
  const [draft, setDraft] = useState(filters);
  const [items, setItems] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  const [view, setView] = useState('list');
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  usePageMeta({ title: t('search.title'), description: t('home.subtitle') });

  useEffect(() => {
    setDraft(filters);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    setItems(null);
    const page = await searchListings({ filters });
    setItems(page.items || []);
    setCursor(page.next_cursor || null);
    setHasMore(Boolean(page.has_more));
    const count = await base44.entities.Listing.count(buildQuery(filters)).catch(() => null);
    setTotal(count);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await searchListings({ filters, cursor });
      setItems((prev) => [...(prev || []), ...(page.items || [])]);
      setCursor(page.next_cursor || null);
      setHasMore(Boolean(page.has_more));
    } finally {
      setLoadingMore(false);
    }
  };

  const apply = (next = draft) => setParams(filtersToParams(next));

  const reset = () => {
    const cleaned = { deal: filters.deal };
    setDraft(cleaned);
    setParams(filtersToParams(cleaned));
  };

  const setSort = (sort) => setParams(filtersToParams({ ...filters, sort }));

  const activeChips = [
    filters.city,
    filters.district,
    filters.metro,
    filters.category ? t(`category.${filters.category}`) : null,
    filters.rooms ? t('units.roomCount', { count: Number(filters.rooms) }) : null,
    filters.priceMax ? `≤ ${filters.priceMax} ₽` : null,
    filters.pets ? t('search.pets') : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-xs mb-1.5">{t('search.resultsFor')}</p>
          <h1 className="font-display text-2xl sm:text-3xl">
            {filters.deal === 'rent' ? t('nav.rent') : t('nav.buy')}
            {filters.city ? ` · ${filters.city}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === null ? t('common.loading') : t('search.found', { count: total })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-44 rounded-full text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys({ relevance: 1, priceAsc: 1, priceDesc: 1, dateDesc: 1, areaDesc: 1 }).map((sort) => (
                <SelectItem key={sort} value={sort}>{t(`search.sort.${sort}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 rounded-full" onClick={() => setSaveOpen(true)} disabled={!isAuthenticated}>
            <Bookmark className="mr-1.5 h-4 w-4" />
            {t('search.saveSearch')}
          </Button>
          <div className="inline-flex rounded-full border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label={t('search.list')}
              className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              <List className="h-3.5 w-3.5" /> {t('search.list')}
            </button>
            <button
              type="button"
              onClick={() => setView('map')}
              aria-label={t('search.map')}
              className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs ${view === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              <MapIcon className="h-3.5 w-3.5" /> {t('search.map')}
            </button>
          </div>
        </div>
      </div>

      {activeChips.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {activeChips.map((chip) => (
            <span key={chip} className="chip">{chip}</span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[270px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-4">
            <FilterPanel value={draft} onChange={setDraft} onApply={() => apply()} onReset={reset} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1 rounded-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {t('common.filters')}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl">
                <SheetTitle className="mb-4 font-display text-xl font-normal">{t('search.filtersTitle')}</SheetTitle>
                <FilterPanel value={draft} onChange={setDraft} onApply={() => apply()} onReset={reset} />
              </SheetContent>
            </Sheet>
            <p className="text-xs text-muted-foreground">{t('search.found', { count: total || 0 })}</p>
          </div>

          {items === null ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((key) => <SkeletonCard key={key} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title={t('search.noResults')} text={t('search.noResultsHint')} actionLabel={t('common.reset')} onAction={reset} />
          ) : view === 'map' ? (
            <SearchMap listings={items} city={filters.city} onOpen={(url) => navigate(url)} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    favorite={isFavorite(listing.id)}
                    onToggleFavorite={isAuthenticated ? toggle : undefined}
                  />
                ))}
              </div>
              {hasMore ? (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" className="rounded-full px-6" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? t('common.loading') : t('common.loadMore')}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <SaveSearchDialog open={saveOpen} onOpenChange={setSaveOpen} filters={filters} />
    </div>
  );
}