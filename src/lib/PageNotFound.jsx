import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-content flex-col items-center justify-center px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
        <Compass className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="mt-6 font-display text-6xl">404</p>
      <h1 className="mt-2 font-heading text-lg font-semibold">{t('errors.notFound')}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t('errors.notFoundText')}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{location.pathname}</p>
      <Button asChild className="mt-6 rounded-full px-6">
        <Link to="/">{t('common.backHome')}</Link>
      </Button>
    </div>
  );
}