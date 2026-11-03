import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

export default function CtaBanner() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-content px-4 pb-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl">{t('home.ctaTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">{t('home.ctaText')}</p>
          </div>
          <Button asChild size="lg" className="w-fit rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/listings/new">
              {t('home.ctaButton')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}