import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import LanguageSwitcher from './LanguageSwitcher';
import RoleSwitcher from './RoleSwitcher';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import { NAV_ITEMS } from './navItems';

export default function Header() {
  const { t } = useI18n();
  const { isAuthenticated } = useAccount();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = `${location.pathname}${location.search}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t('header.menu')}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link to="/" className="flex items-center gap-1.5">
          <span className="font-display text-[22px] leading-none tracking-tight">ReDom</span>
          <span className="mb-3 h-1.5 w-1.5 rounded-full bg-accent" />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = current === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <RoleSwitcher />
          <NotificationBell />
          <Button asChild size="sm" className="hidden rounded-full px-4 sm:inline-flex">
            <Link to="/listings/new">
              <Plus className="mr-1 h-4 w-4" />
              {t('nav.listProperty')}
            </Link>
          </Button>
          {!isAuthenticated ? (
            <Button asChild size="sm" variant="outline" className="rounded-full sm:hidden">
              <Link to="/listings/new">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <UserMenu />
        </div>
      </div>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}