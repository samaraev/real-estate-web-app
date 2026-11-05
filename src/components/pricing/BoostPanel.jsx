import React, { useCallback, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { toast } from '@/components/ui/use-toast';

export default function BoostPanel() {
  const { t, money, date } = useI18n();
  const { user } = useAccount();
  const [listings, setListings] = useState(null);
  const me = user?.id;

  const load = useCallback(async () => {
    if (!me) return;
    const page = await base44.entities.Listing.filter(
      { created_by_id: me, status: 'published' },
      { sort: '-created_date', limit: 20 }
    );
    setListings(page.items);
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);

  const boost = async (listing) => {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    await base44.entities.Listing.update(listing.id, { boost_until: until.toISOString() });
    toast({ title: t('pricing.boosted') });
    load();
  };

  const active = (listing) => listing.boost_until && new Date(listing.boost_until) > new Date();

  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">{t('pricing.boostSection')}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('pricing.boostText', { price: money(DEFAULT_SETTINGS.boost_price) })} · {t('pricing.boostHint')}
      </p>
      {listings === null ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : listings.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('pricing.boostEmpty')}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{listing.title}</p>
                <p className="text-xs text-muted-foreground">
                  {active(listing) ? t('pricing.boostOn', { date: date(listing.boost_until) }) : t('pricing.boostTitle')}
                </p>
              </div>
              <Button
                size="sm"
                variant={active(listing) ? 'outline' : 'secondary'}
                className="rounded-full"
                disabled={active(listing)}
                onClick={() => boost(listing)}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" /> {t('pricing.boostActivate')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}