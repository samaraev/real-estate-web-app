import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

export default function Footer() {
  const { t, date } = useI18n();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: 'footer.forClients',
      links: [
        { to: '/search?deal=sale', key: 'nav.buy' },
        { to: '/search?deal=rent', key: 'nav.rent' },
        { to: '/neighborhoods', key: 'nav.neighborhoods' },
        { to: '/mortgage', key: 'nav.mortgage' },
      ],
    },
    {
      title: 'footer.forOwners',
      links: [
        { to: '/listings/new', key: 'nav.listProperty' },
        { to: '/rent', key: 'nav.manage' },
        { to: '/pricing', key: 'nav.pricing' },
        { to: '/partners', key: 'nav.partners' },
      ],
    },
    {
      title: 'footer.company',
      links: [
        { to: '/agencies', key: 'nav.agencies' },
        { to: '/deals', key: 'nav.deals' },
        { to: '/documents', key: 'nav.documents' },
        { to: '/settings', key: 'nav.settings' },
      ],
    },
    {
      title: 'footer.legal',
      links: [
        { to: '/legal/privacy', key: 'footer.privacy' },
        { to: '/legal/terms', key: 'footer.terms' },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto grid w-full max-w-content gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-2xl">ReDom</span>
            <span className="mb-3 h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{t('footer.tagline')}</p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">{t('footer.mockNote')}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="label-xs">{t(column.title)}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-content flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>{t('footer.rights', { year })}</span>
          <span>{date(new Date(), { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </footer>
  );
}