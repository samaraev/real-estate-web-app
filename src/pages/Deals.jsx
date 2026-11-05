import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Plus } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Stat from '@/components/rent/Stat';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealBoard from '@/components/deals/DealBoard';
import DealDialog from '@/components/deals/DealDialog';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';
import { ALL_STAGES, dealTitle } from '@/lib/deals';
import usePageMeta from '@/hooks/usePageMeta';

export default function Deals() {
  const { t, money } = useI18n();
  const { user } = useAccount();
  const [deals, setDeals] = useState(null);
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('board');
  const [dialogOpen, setDialogOpen] = useState(false);
  usePageMeta({ title: t('deals.title') });

  const me = user?.id;

  const load = useCallback(async () => {
    if (!me) return;
    const [dealPage, listingPage] = await Promise.all([
      base44.entities.Deal.filter(
        { $or: [{ created_by_id: me }, { owner_user_id: me }, { buyer_user_id: me }, { agent_user_id: me }] },
        { sort: '-updated_date', limit: 200 }
      ),
      base44.entities.Listing.filter({ created_by_id: me }, { sort: '-created_date', limit: 100 }),
    ]);
    setDeals(dealPage.items);
    setListings(listingPage.items);
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const rows = deals || [];
    const open = rows.filter((deal) => !['won', 'lost'].includes(deal.stage));
    return {
      open: open.length,
      sum: open.reduce((total, deal) => total + Number(deal.amount || 0), 0),
      won: rows.filter((deal) => deal.stage === 'won').length,
      commission: open.reduce((total, deal) => total + Number(deal.commission || 0), 0),
    };
  }, [deals]);

  const move = async (deal, stage) => {
    await base44.entities.Deal.update(deal.id, { stage });
    setDeals((prev) => prev.map((item) => (item.id === deal.id ? { ...item, stage } : item)));
    toast({ title: t('deals.stageChanged') });
  };

  return (
    <>
      <PageHeader
        eyebrow={t('nav.deals')}
        title={t('deals.title')}
        actions={
          <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> {t('deals.new')}
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t('deals.stats.open')} value={stats.open} />
          <Stat label={t('deals.stats.sum')} value={money(stats.sum)} />
          <Stat label={t('deals.stats.won')} value={stats.won} tone="positive" />
          <Stat label={t('deals.stats.commission')} value={money(stats.commission)} />
        </div>

        {deals === null ? (
          <div className="pt-10">
            <Loading />
          </div>
        ) : deals.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              icon={Handshake}
              title={t('deals.empty')}
              text={t('deals.emptyHint')}
              actionLabel={t('deals.new')}
              onAction={() => setDialogOpen(true)}
            />
          </div>
        ) : (
          <>
            <div className="my-5 flex items-center justify-between gap-2">
              <Tabs value={view} onValueChange={setView}>
                <TabsList>
                  <TabsTrigger value="board">{t('deals.board')}</TabsTrigger>
                  <TabsTrigger value="list">{t('deals.list')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {view === 'board' ? (
              <DealBoard deals={deals} onMove={move} />
            ) : (
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex flex-wrap items-center gap-3 p-3">
                    <Link to={`/deals/${deal.id}`} className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-semibold">{dealTitle(deal)}</p>
                      <p className="truncate text-xs text-muted-foreground">{deal.buyer_name || '—'}</p>
                    </Link>
                    <span className="font-heading text-sm font-semibold">{money(deal.amount, deal.currency || 'RUB')}</span>
                    <select
                      value={deal.stage || 'inquiry'}
                      onChange={(event) => move(deal, event.target.value)}
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                    >
                      {ALL_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {t(`deals.stages.${stage}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        listings={listings}
        onCreated={(created) => setDeals((prev) => [created, ...(prev || [])])}
      />
    </>
  );
}