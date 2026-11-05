import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import { useI18n } from '@/i18n';

export default function Layout() {
  const location = useLocation();
  const { t, locale } = useI18n();
  const mainRef = useRef(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t('a11y.skipToContent')}
      </a>
      <Header />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}