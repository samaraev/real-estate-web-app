import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, Settings, Shield, UserRound, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n';
import useTheme from '@/hooks/useTheme';

export default function UserMenu() {
  const { t } = useI18n();
  const { user, isAuthenticated, isAdmin, displayName } = useAccount();
  const { logout, navigateToLogin } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Button size="sm" className="rounded-full px-4" onClick={() => navigateToLogin()}>
        {t('header.login')}
      </Button>
    );
  }

  const initials = (displayName || 'R')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('header.profile')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2">
          <Settings className="h-4 w-4" /> {t('nav.settings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/favorites')} className="gap-2">
          <Heart className="h-4 w-4" /> {t('nav.favorites')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/my-listings')} className="gap-2">
          <LayoutDashboard className="h-4 w-4" /> {t('nav.myListings')}
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-2">
            <Shield className="h-4 w-4" /> {t('nav.admin')}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="gap-2">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {t('settings.appearance')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" /> {t('header.logout')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2">
          <Link to="/settings">
            <UserRound className="h-4 w-4" /> {t('settings.profile')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}