import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ru from './ru.json';
import en from './en.json';
import phase6 from './phase6';

const merge = (base, extra) => {
  const out = { ...base };
  Object.entries(extra).forEach(([key, value]) => {
    out[key] =
      value && typeof value === 'object' && !Array.isArray(value) ? merge(base[key] || {}, value) : value;
  });
  return out;
};

// Adding a language = add a JSON file here and register it below.
export const LOCALES = {
  ru: { label: 'RU', name: 'Русский' },
  en: { label: 'EN', name: 'English' },
};

const MESSAGES = { ru: merge(ru, phase6.ru), en: merge(en, phase6.en) };
const STORAGE_KEY = 'redom_locale';
const FALLBACK = 'ru';

const resolvePath = (source, path) =>
  path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), source);

const interpolate = (value, params) =>
  value.replace(/\{(\w+)\}/g, (match, name) => (params[name] === undefined ? match : String(params[name])));

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return stored && MESSAGES[stored] ? stored : FALLBACK;
  });

  const setLocale = useCallback((next) => {
    if (!MESSAGES[next]) return;
    window.localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
  }, [locale]);

  const t = useCallback(
    (key, params = {}) => {
      let raw = resolvePath(MESSAGES[locale], key);
      if (raw === undefined) raw = resolvePath(MESSAGES[FALLBACK], key);
      if (raw === undefined) return key;

      if (raw && typeof raw === 'object' && params.count !== undefined) {
        const form = new Intl.PluralRules(locale).select(Number(params.count));
        const forms = raw;
        raw = forms[form] || forms.other || forms.many || Object.values(forms)[0];
      }
      if (raw && typeof raw === 'object') {
        raw = raw.other || raw.many || Object.values(raw)[0];
      }
      return interpolate(String(raw), params);
    },
    [locale]
  );

  const intlLocale = locale === 'ru' ? 'ru-RU' : 'en-US';

  const money = useCallback(
    (value, currency = 'RUB', options = {}) =>
      new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency,
        maximumFractionDigits: options.decimals ? 2 : 0,
        minimumFractionDigits: 0,
      }).format(Number(value || 0)),
    [intlLocale]
  );

  const num = useCallback(
    (value, options = {}) => new Intl.NumberFormat(intlLocale, options).format(Number(value || 0)),
    [intlLocale]
  );

  const date = useCallback(
    (value, options) => {
      if (!value) return '—';
      const parsed = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(parsed.getTime())) return '—';
      return new Intl.DateTimeFormat(intlLocale, options || { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed);
    },
    [intlLocale]
  );

  const dateTime = useCallback(
    (value) => date(value, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    [date]
  );

  const monthLabel = useCallback(
    (value) => {
      if (!value) return '—';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return '—';
      return new Intl.DateTimeFormat(intlLocale, { month: 'long', year: 'numeric' }).format(parsed);
    },
    [intlLocale]
  );

  const relative = useCallback(
    (value) => {
      if (!value) return '';
      const diff = new Date(value).getTime() - Date.now();
      const abs = Math.abs(diff);
      const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });
      const units = [
        ['year', 31536000000],
        ['month', 2592000000],
        ['day', 86400000],
        ['hour', 3600000],
        ['minute', 60000],
      ];
      for (const [unit, ms] of units) {
        if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
      }
      return rtf.format(Math.round(diff / 1000), 'second');
    },
    [intlLocale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, money, num, date, dateTime, monthLabel, relative, locales: LOCALES }),
    [locale, setLocale, t, money, num, date, dateTime, monthLabel, relative]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

export default useI18n;