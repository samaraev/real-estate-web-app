import React from 'react';
import { useI18n } from '@/i18n';
import { CITIES, CATEGORIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const ANY = 'any';

export default function FilterPanel({ value, onChange, onApply, onReset }) {
  const { t, locale } = useI18n();
  const set = (key, next) => onChange({ ...value, [key]: next });
  const city = CITIES.find((item) => item.name.ru === value.city);

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.dealType')}</Label>
        <div className="inline-flex w-full rounded-xl border border-border bg-background p-1">
          {[
            { id: 'sale', label: t('form.dealTypeSale') },
            { id: 'rent', label: t('form.dealTypeRent') },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => set('deal', option.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                value.deal === option.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.category')}</Label>
        <Select value={value.category || ANY} onValueChange={(next) => set('category', next === ANY ? '' : next)}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t('search.any')}</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {t(`category.${category}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">{t('common.city')}</Label>
        <Select value={value.city || ANY} onValueChange={(next) => set('city', next === ANY ? '' : next)}>
          <SelectTrigger className="h-10"><SelectValue placeholder={t('common.allCities')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>{t('common.allCities')}</SelectItem>
            {CITIES.map((item) => (
              <SelectItem key={item.id} value={item.name.ru}>{item.name[locale] || item.name.ru}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.district')}</Label>
          <Select value={value.district || ANY} onValueChange={(next) => set('district', next === ANY ? '' : next)} disabled={!city}>
            <SelectTrigger className="h-10"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>—</SelectItem>
              {(city?.districts || []).map((district) => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.metro')}</Label>
          <Select value={value.metro || ANY} onValueChange={(next) => set('metro', next === ANY ? '' : next)} disabled={!city}>
            <SelectTrigger className="h-10"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>—</SelectItem>
              {(city?.metro || []).map((station) => (
                <SelectItem key={station} value={station}>{station}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.rooms')}</Label>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={!value.rooms ? 'default' : 'outline'}
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => set('rooms', '')}
          >
            {t('search.any')}
          </Button>
          {[0, 1, 2, 3, 4].map((rooms) => (
            <Button
              key={rooms}
              type="button"
              size="sm"
              variant={String(value.rooms) === String(rooms) ? 'default' : 'outline'}
              className="h-8 min-w-9 rounded-full px-3 text-xs"
              onClick={() => set('rooms', String(rooms))}
            >
              {rooms === 0 ? t('search.studio') : rooms === 4 ? '4+' : rooms}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.price')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('common.from')}
            value={value.priceMin || ''}
            onChange={(event) => set('priceMin', event.target.value)}
            className="h-10"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('common.to')}
            value={value.priceMax || ''}
            onChange={(event) => set('priceMax', event.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.area')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('common.from')}
            value={value.areaMin || ''}
            onChange={(event) => set('areaMin', event.target.value)}
            className="h-10"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('common.to')}
            value={value.areaMax || ''}
            onChange={(event) => set('areaMax', event.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">{t('search.keyword')}</Label>
        <Input
          value={value.keyword || ''}
          onChange={(event) => set('keyword', event.target.value)}
          placeholder={t('home.searchPlaceholder')}
          className="h-10"
        />
      </div>

      <div className="space-y-2.5">
        {[
          { key: 'pets', label: t('search.pets') },
          { key: 'children', label: t('search.children') },
          { key: 'utilities', label: t('search.utilitiesIncluded') },
        ].map((option) => (
          <label key={option.key} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={Boolean(value[option.key])} onCheckedChange={(checked) => set(option.key, Boolean(checked))} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <Button className="flex-1 rounded-full" onClick={onApply}>{t('common.apply')}</Button>
        <Button variant="outline" className="rounded-full" onClick={onReset}>{t('common.reset')}</Button>
      </div>
    </div>
  );
}