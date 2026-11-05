import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, Handshake, Heart, LayoutDashboard, LogOut, MessageSquare, Shield, Wallet } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import RoleSwitcher from './RoleSwitcher';
import { NAV_ITEMS } from './navItems';
import { Button } from '@/components/ui/button';

export default function MobileMenu({ open, onOpenChange }) {
  const { t } = useI18n();
  const { isAuthenticated, isAdmin, displayName } = useAccount();
  const { logout, navigateToLogin } = useAuth();
  const close = () => onOpenChange(false);

  const accountLinks = [
    { to: '/favorites', key: 'nav.favorites', icon: Heart },
    { to: '/messages', key: 'nav.messages', icon: MessageSquare },
    { to: '/viewings', key: 'nav.viewings', icon: CalendarDays },
    { to: '/my-listings', key: 'nav.myListings', icon: LayoutDashboard },
    { to: '/rent', key: 'nav.manage', icon: Wallet },
    { to: '/deals', key: 'nav.deals', icon: Handshake },
    { to: '/documents', key: 'nav.documents', icon: FileText },
    { to: '/settings', key: 'nav.settings', icon: Shield },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-display text-xl font-normal">ReDom</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
          <LanguageSwitcher />
          <RoleSwitcher />
        </div>

        <nav className="flex flex-col px-2 py-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className="rounded-xl px-3 py-3 text-[15px] text-foreground transition-colors hover:bg-secondary"
            >
              {t(item.key)}
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          {accountLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="h-4 w-4" strokeWidth={1.6} />
              {t(item.key)}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              to="/admin"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-accent transition-colors hover:bg-secondary"
            >
              <Shield className="h-4 w-4" strokeWidth={1.6} />
              {t('nav.admin')}
            </Link>
          ) : null}
        </nav>

        <div className="mt-auto border-t border-border p-5">
          {isAuthenticated ? (
            <>
              <p className="mb-1 label-xs">{t('header.signedInAs')}</p>
              <p className="mb-3 truncate text-sm font-medium">{displayName}</p>
              <Button variant="outline" className="w-full rounded-full" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('header.logout')}
              </Button>
            </>
          ) : (
            <Button className="w-full rounded-full" onClick={() => { close(); navigateToLogin(); }}>
              {t('header.login')}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}