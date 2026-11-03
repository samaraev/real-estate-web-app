import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { CITIES } from '@/lib/constants';

export default function HeroSearch({ defaultDeal = 'sale' }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(defaultDeal);
  const [city, setCity] = useState('');
  const [nlText, setNlText] = useState('');
  const [nlBusy, setNlBusy] = useState(false);
  const [nlError, setNlError] = useState('');

  const submitBasic = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ deal });
    if (city) params.set('city', city);
    navigate(`/search?${params.toString()}`);
  };

  const submitNatural = async () => {
    if (nlText.trim().length < 3) return;
    setNlBusy(true);
    setNlError('');
    try {
      const response = await base44.functions.invoke('nlSearch', { text: nlText, language: locale });
      const parsed = response.data || {};
      const params = new URLSearchParams();
      params.set('deal', parsed.deal_type || deal);
      if (parsed.city) params.set('city', parsed.city);
      if (parsed.rooms) params.set('rooms', parsed.rooms);
      if (parsed.price_max) params.set('priceMax', parsed.price_max);
      if (parsed.price_min) params.set('priceMin', parsed.price_min);
      if (parsed.metro) params.set('metro', parsed.metro);
      if (parsed.district) params.set('district', parsed.district);
      if (parsed.category) params.set('category', parsed.category);
      if (parsed.pets) params.set('pets', '1');
      if (parsed.children) params.set('children', '1');
      params.set('nl', '1');
      navigate(`/search?${params.toString()}`);
    } catch {
      setNlError(t('home.nlEmpty'));
    } finally {
      setNlBusy(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3 inline-flex rounded-full border border-border bg-card p-1">
        {['sale', 'rent'].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setDeal(option)}
            className={`rounded-full px-5 py-1.5 text-sm transition-colors ${
              deal === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`home.tabs.${option}`)}
          </button>
        ))}
      </div>

      <form onSubmit={submitBasic} className="rounded-2xl border border-border bg-card p-2 shadow-[0_20px_60px_-40px_rgba(16,48,42,0.5)] sm:p-2.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary/60 px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={t('home.searchPlaceholder')}
              className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              aria-label={t('home.searchPlaceholder')}
            />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 w-full rounded-xl border-0 bg-secondary/60 sm:w-44" aria-label={t('common.city')}>
              <SelectValue placeholder={t('common.allCities')} />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((item) => (
                <SelectItem key={item.id} value={item.name.ru}>
                  {item.name[locale] || item.name.ru}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="h-12 rounded-xl px-7 text-sm">
            {t('common.search')}
          </Button>
        </div>
      </form>

      <div className="mt-3 rounded-2xl border border-dashed border-border bg-card/70 p-3">
        <div className="mb-2 flex items-center gap-1.5 label-xs">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {t('home.nlLabel')}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={nlText}
            onChange={(event) => setNlText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitNatural();
              }
            }}
            placeholder={t('home.nlPlaceholder')}
            className="h-11 flex-1 rounded-xl bg-background"
            aria-label={t('home.nlLabel')}
          />
          <Button type="button" variant="outline" onClick={submitNatural} disabled={nlBusy} className="h-11 rounded-xl">
            {nlBusy ? t('common.processing') : t('home.nlApply')}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{nlError || t('home.nlHint')}</p>
      </div>
    </div>
  );
}