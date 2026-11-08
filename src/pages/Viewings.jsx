import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CalendarX } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

const STATUS_STYLE = {
  requested: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  rescheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  completed: 'bg-secondary text-muted-foreground',
};

export default function Viewings() {
  const { t, dateTime } = useI18n();
  const { user, isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState('incoming');

  const load = useCallback(async () => {
    const page = await base44.entities.Viewing.filter({}, { sort: 'slot_start', limit: 100 });
    setItems(page.items || []);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    load();
  }, [isAuthenticated, load, navigateToLogin]);

  const update = async (viewing, status) => {
    await base44.entities.Viewing.update(viewing.id, { status });
    toast({ title: t(`viewings.status.${status}`) });
    load();
  };

  const incoming = (items || []).filter((item) => item.owner_user_id === user?.id);
  const outgoing = (items || []).filter((item) => item.owner_user_id !== user?.id);
  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('nav.viewings')} title={t('viewings.title')} />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 rounded-full bg-secondary/60 p-1">
            <TabsTrigger value="incoming" className="rounded-full text-xs">{t('viewings.tabs.incoming')}</TabsTrigger>
            <TabsTrigger value="outgoing" className="rounded-full text-xs">{t('viewings.tabs.outgoing')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {items === null ? (
          <Loading />
        ) : list.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={t('viewings.empty')} actionLabel={t('nav.rent')} actionTo="/search?deal=rent" />
        ) : (
          <ul className="space-y-3">
            {list.map((viewing) => (
              <li key={viewing.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[viewing.status] || STATUS_STYLE.requested}`}>
                      {t(`viewings.status.${viewing.status}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">{dateTime(viewing.slot_start)}</span>
                  </div>
                  <Link to={`/listing/${viewing.listing_id}`} className="mt-1 block truncate font-heading text-sm font-semibold hover:underline">
                    {viewing.listing_title}
                  </Link>
                  {viewing.comment ? <p className="mt-0.5 text-xs text-muted-foreground">{viewing.comment}</p> : null}
                  {viewing.contact_phone ? <p className="mt-0.5 text-xs text-muted-foreground">{viewing.contact_phone}</p> : null}
                </div>
                <div className="flex gap-1.5">
                  {tab === 'incoming' && viewing.status === 'requested' ? (
                    <Button size="sm" className="rounded-full" onClick={() => update(viewing, 'confirmed')}>
                      <CalendarCheck className="mr-1 h-3.5 w-3.5" />{t('viewings.confirm')}
                    </Button>
                  ) : null}
                  {['requested', 'confirmed', 'rescheduled'].includes(viewing.status) ? (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(viewing, 'cancelled')}>
                      <CalendarX className="mr-1 h-3.5 w-3.5" />{t('viewings.cancel')}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}