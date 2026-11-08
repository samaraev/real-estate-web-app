import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useI18n } from '@/i18n';

const UserNotRegisteredError = () => {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <ShieldAlert className="h-8 w-8" strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 font-display text-2xl leading-tight">{t('errors.accessTitle')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t('errors.accessText')}</p>
        <div className="mt-6 rounded-xl bg-secondary/60 p-4 text-left text-sm text-muted-foreground">
          <p>{t('errors.accessHint')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{t('errors.accessAccount')}</li>
            <li>{t('errors.accessAdmin')}</li>
            <li>{t('errors.accessRelogin')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;