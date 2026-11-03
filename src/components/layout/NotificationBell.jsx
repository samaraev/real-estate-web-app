import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAccount } from '@/lib/AccountContext';
import { useI18n } from '@/i18n';

export default function NotificationBell() {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAccount();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await base44.entities.Notification.count({ user_id: user.id, is_read: false });
      setUnread(count);
    } catch {
      setUnread(0);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.data?.user_id === user.id) refresh();
    });
    return unsubscribe;
  }, [user?.id, refresh]);

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/notifications"
      aria-label={t('header.notifications')}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40"
    >
      <Bell className="h-4 w-4" strokeWidth={1.7} />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}