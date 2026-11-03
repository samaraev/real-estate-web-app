import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Archive, RotateCcw, Sparkles, Building2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import { FALLBACK_PHOTO, roomsLabel } from '@/lib/listings';
import { toast } from '@/components/ui/use-toast';

const STATUS_STYLE = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  draft: 'bg-secondary text-foreground/70',
  archived: 'bg-secondary text-muted-foreground',
  rented: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  sold: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
};

export default function MyListings() {
  const { t, money } = useI18n();
  const { user, isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    if (!user?.id) return;
    const page = await base44.entities.Listing.filter({ owner_user_id: user.id }, { sort: '-created_date', limit: 100 });
    setItems(page.items || []);
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    load();
  }, [isAuthenticated, load, navigateToLogin]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (tab === 'all') return items;
    return items.filter((item) => item.status === tab);
  }, [items, tab]);

  const updateStatus = async (listing, status) => {
    await base44.entities.Listing.update(listing.id, { status });
    toast({ title: t('common.saved') });
    load();
  };

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={t('nav.myListings')}
        title={t('myListings.title')}
        actions={
          <Button asChild className="rounded-full">
            <Link to="/listings/new"><Plus className="mr-1.5 h-4 w-4" />{t('myListings.create')}</Link>
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 flex w-full justify-start gap-1 overflow-x-auto rounded-full bg-secondary/60 p-1">
            {['all', 'published', 'pending', 'draft', 'archived'].map((key) => (
              <TabsTrigger key={key} value={key} className="rounded-full px-3 text-xs">
                {t(`myListings.tabs.${key}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {items === null ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={t('myListings.empty')}
            text={t('myListings.emptyHint')}
            actionLabel={t('myListings.create')}
            actionTo="/listings/new"
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((listing) => (
              <li key={listing.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
                <img
                  src={listing.cover_url || FALLBACK_PHOTO}
                  alt=""
                  className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-28"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[listing.status] || STATUS_STYLE.draft}`}>
                      {t(`myListings.status.${listing.status}`)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{t(listing.deal_type === 'rent' ? 'form.dealTypeRent' : 'form.dealTypeSale')}</span>
                    {listing.boost_until && new Date(listing.boost_until) > new Date() ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent">
                        <Sparkles className="h-3 w-3" /> TOP
                      </span>
                    ) : null}
                  </div>
                  <Link to={`/listing/${listing.id}`} className="mt-1 block truncate font-heading text-sm font-semibold hover:underline">
                    {listing.title}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {money(listing.price, listing.currency)} · {roomsLabel(t, listing.rooms)} · {listing.area} {t('units.sqm')} · {listing.city}
                  </p>
                  {listing.status === 'rejected' && listing.rejection_reason ? (
                    <p className="mt-1 text-xs text-destructive">{t('myListings.rejectedReason')}: {listing.rejection_reason}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.views_count || 0}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(`/listings/${listing.id}/edit`)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" />{t('common.edit')}
                  </Button>
                  {listing.status === 'archived' ? (
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => updateStatus(listing, 'draft')}>
                      <RotateCcw className="mr-1 h-3.5 w-3.5" />{t('myListings.restore')}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => updateStatus(listing, 'archived')}>
                      <Archive className="mr-1 h-3.5 w-3.5" />{t('myListings.archive')}
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" className="rounded-full" onClick={() => navigate('/pricing')}>
                    <Sparkles className="mr-1 h-3.5 w-3.5" />{t('myListings.boost')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}