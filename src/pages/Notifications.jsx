import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';

export default function Notifications() {
  const { t, relative } = useI18n();
  const { user, isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    if (!user?.id) return;
    const page = await base44.entities.Notification.filter({ user_id: user.id }, { sort: '-created_date', limit: 100 });
    setItems(page.items || []);
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    load();
  }, [isAuthenticated, load, navigateToLogin]);

  const markAll = async () => {
    const unread = (items || []).filter((item) => !item.is_read);
    await Promise.all(unread.map((item) => base44.entities.Notification.update(item.id, { is_read: true })));
    load();
  };

  const markOne = async (notification) => {
    if (notification.is_read) return;
    await base44.entities.Notification.update(notification.id, { is_read: true });
    load();
  };

  const visible = (items || []).filter((item) => (tab === 'all' ? true : !item.is_read));

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={t('nav.notifications')}
        title={t('notifications.title')}
        actions={
          <Button variant="outline" className="rounded-full" onClick={markAll}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            {t('header.markAllRead')}
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 rounded-full bg-secondary/60 p-1">
            <TabsTrigger value="all" className="rounded-full text-xs">{t('notifications.all')}</TabsTrigger>
            <TabsTrigger value="unread" className="rounded-full text-xs">{t('notifications.unreadOnly')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {items === null ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState icon={Bell} title={t('notifications.empty')} />
        ) : (
          <ul className="space-y-2">
            {visible.map((notification) => {
              const content = (
                <>
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.is_read ? 'bg-border' : 'bg-accent'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {t(`notifications.types.${notification.type}`, { defaultValue: notification.type })}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">{relative(notification.created_date)}</p>
                  </div>
                </>
              );
              return (
                <li key={notification.id}>
                  {notification.link ? (
                    <Link
                      to={notification.link}
                      onClick={() => markOne(notification)}
                      className={`flex gap-3 rounded-2xl border p-4 transition-colors ${notification.is_read ? 'border-border bg-card' : 'border-accent/30 bg-accent/5'}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markOne(notification)}
                      className={`flex w-full gap-3 rounded-2xl border p-4 text-left transition-colors ${notification.is_read ? 'border-border bg-card' : 'border-accent/30 bg-accent/5'}`}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}