import React from 'react';
import { Check, ChevronDown, UserRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAccount } from '@/lib/AccountContext';
import { useI18n } from '@/i18n';
import { APP_ROLES } from '@/lib/constants';

export default function RoleSwitcher() {
  const { t } = useI18n();
  const { isAuthenticated, roles, activeRole, switchRole } = useAccount();

  if (!isAuthenticated) return null;

  const available = APP_ROLES.filter((role) => roles.includes(role));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
        >
          <UserRound className="h-3.5 w-3.5 text-accent" />
          <span className="max-w-[7.5rem] truncate">{t(`roles.${activeRole}`)}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{t('roles.switchHint')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {available.map((role) => (
          <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="gap-2">
            <Check className={`h-4 w-4 ${role === activeRole ? 'text-accent' : 'opacity-0'}`} />
            {t(`roles.${role}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}