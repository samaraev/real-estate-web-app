import { useEffect } from 'react';
import { useI18n } from '@/i18n';

/**
 * Localized document metadata: title, description, og tags, robots, JSON-LD and hreflang.
 * Russian is the canonical default; English is served with the same URL and
 * announced via hreflang alternates.
 */
export default function usePageMeta({ title, description, image, jsonLd, noindex = false }) {
  const { locale } = useI18n();
  const structured = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title ? `${title} · ReDom` : 'ReDom — покупка, аренда и управление арендой';
    document.title = fullTitle;

    const setMeta = (attr, name, content) => {
      if (!content) return;
      let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    if (description) setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    if (description) setMeta('property', 'og:description', description);
    setMeta('property', 'og:locale', locale === 'ru' ? 'ru_RU' : 'en_US');
    if (image) setMeta('property', 'og:image', image);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + window.location.pathname);

    ['ru', 'en'].forEach((code) => {
      let alt = document.head.querySelector(`link[hreflang="${code}"]`);
      if (!alt) {
        alt = document.createElement('link');
        alt.setAttribute('rel', 'alternate');
        alt.setAttribute('hreflang', code);
        document.head.appendChild(alt);
      }
      alt.setAttribute('href', `${window.location.origin}${window.location.pathname}?lang=${code}`);
    });
    const fallback = document.head.querySelector('link[hreflang="x-default"]');
    if (!fallback) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', 'x-default');
      link.setAttribute('href', window.location.origin + window.location.pathname);
      document.head.appendChild(link);
    }

    let ld = document.head.querySelector('script[data-page-jsonld]');
    if (structured) {
      if (!ld) {
        ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.setAttribute('data-page-jsonld', '');
        document.head.appendChild(ld);
      }
      ld.textContent = structured;
    } else if (ld) {
      ld.remove();
    }
  }, [title, description, image, locale, structured, noindex]);
}