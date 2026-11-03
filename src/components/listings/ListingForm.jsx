import React from 'react';
import { useI18n } from '@/i18n';
import { CITIES, CATEGORIES, AMENITIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FIELD = 'h-10';

export default function ListingForm({ value, onChange }) {
  const { t, locale } = useI18n();
  const set = (key, next) => onChange({ ...value, [key]: next });
  const city = CITIES.find((item) => item.name.ru === value.city);
  const isRent = value.deal_type === 'rent';

  const toggleAmenity = (amenity) => {
    const list = value.amenities || [];
    set('amenities', list.includes(amenity) ? list.filter((item) => item !== amenity) : [...list, amenity]);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">{t('form.dealType')}</Label>
          <div className="inline-flex w-full rounded-xl border border-border bg-background p-1">
            {['sale', 'rent'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => set('deal_type', option)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  value.deal_type === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(`form.dealType${option === 'sale' ? 'Sale' : 'Rent'}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">{t('form.category')}</Label>
          <Select value={value.category} onValueChange={(next) => set('category', next)}>
            <SelectTrigger className={FIELD}><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>{t(`category.${category}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title" className="mb-1.5 block text-xs text-muted-foreground">{t('common.name')}</Label>
        <Input id="title" value={value.title} onChange={(event) => set('title', event.target.value)} placeholder={t('form.titlePlaceholder')} className={FIELD} />
      </div>

      <div>
        <Label htmlFor="description" className="mb-1.5 block text-xs text-muted-foreground">{t('listing.description')}</Label>
        <Textarea id="description" rows={5} value={value.description} onChange={(event) => set('description', event.target.value)} placeholder={t('form.descriptionPlaceholder')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="price" className="mb-1.5 block text-xs text-muted-foreground">{t(isRent ? 'form.rentPrice' : 'form.price')}</Label>
          <Input id="price" type="number" inputMode="numeric" value={value.price} onChange={(event) => set('price', event.target.value)} className={FIELD} />
        </div>
        {isRent ? (
          <div>
            <Label htmlFor="deposit" className="mb-1.5 block text-xs text-muted-foreground">{t('form.deposit')}</Label>
            <Input id="deposit" type="number" inputMode="numeric" value={value.deposit} onChange={(event) => set('deposit', event.target.value)} className={FIELD} />
          </div>
        ) : null}
        <div>
          <Label htmlFor="area" className="mb-1.5 block text-xs text-muted-foreground">{t('form.area')}</Label>
          <Input id="area" type="number" inputMode="decimal" value={value.area} onChange={(event) => set('area', event.target.value)} className={FIELD} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="rooms" className="mb-1.5 block text-xs text-muted-foreground">{t('form.rooms')}</Label>
          <Input id="rooms" type="number" inputMode="numeric" value={value.rooms} onChange={(event) => set('rooms', event.target.value)} className={FIELD} />
        </div>
        <div>
          <Label htmlFor="floor" className="mb-1.5 block text-xs text-muted-foreground">{t('form.floor')}</Label>
          <Input id="floor" type="number" value={value.floor} onChange={(event) => set('floor', event.target.value)} className={FIELD} />
        </div>
        <div>
          <Label htmlFor="floors" className="mb-1.5 block text-xs text-muted-foreground">{t('form.floors')}</Label>
          <Input id="floors" type="number" value={value.floors} onChange={(event) => set('floors', event.target.value)} className={FIELD} />
        </div>
        <div>
          <Label htmlFor="year_built" className="mb-1.5 block text-xs text-muted-foreground">{t('form.yearBuilt')}</Label>
          <Input id="year_built" type="number" value={value.year_built} onChange={(event) => set('year_built', event.target.value)} className={FIELD} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">{t('form.city')}</Label>
          <Select value={value.city} onValueChange={(next) => onChange({ ...value, city: next, district: '', metro: '' })}>
            <SelectTrigger className={FIELD}><SelectValue placeholder={t('common.city')} /></SelectTrigger>
            <SelectContent>
              {CITIES.map((item) => (
                <SelectItem key={item.id} value={item.name.ru}>{item.name[locale] || item.name.ru}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">{t('form.district')}</Label>
          <Select value={value.district || 'none'} onValueChange={(next) => set('district', next === 'none' ? '' : next)} disabled={!city}>
            <SelectTrigger className={FIELD}><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {(city?.districts || []).map((district) => <SelectItem key={district} value={district}>{district}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">{t('form.metro')}</Label>
          <Select value={value.metro || 'none'} onValueChange={(next) => set('metro', next === 'none' ? '' : next)} disabled={!city}>
            <SelectTrigger className={FIELD}><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {(city?.metro || []).map((station) => <SelectItem key={station} value={station}>{station}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="mb-1.5 block text-xs text-muted-foreground">{t('form.address')}</Label>
        <Input id="address" value={value.address} onChange={(event) => set('address', event.target.value)} placeholder="ул. Остоженка, 12" className={FIELD} />
      </div>

      <div>
        <p className="label-xs mb-2">{t('form.amenities')}</p>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((amenity) => {
            const active = (value.amenities || []).includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`amenity.${amenity}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { key: 'pets_allowed', label: t('form.petsAllowed') },
          { key: 'children_allowed', label: t('form.childrenAllowed') },
          { key: 'utilities_included', label: t('form.utilitiesIncluded') },
        ].map((option) => (
          <label key={option.key} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={Boolean(value[option.key])} onCheckedChange={(checked) => set(option.key, Boolean(checked))} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="video_url" className="mb-1.5 block text-xs text-muted-foreground">{t('form.videoUrl')}</Label>
          <Input id="video_url" value={value.video_url} onChange={(event) => set('video_url', event.target.value)} placeholder="https://" className={FIELD} />
        </div>
        <div>
          <Label htmlFor="floor_plan_url" className="mb-1.5 block text-xs text-muted-foreground">{t('form.floorPlanUrl')}</Label>
          <Input id="floor_plan_url" value={value.floor_plan_url} onChange={(event) => set('floor_plan_url', event.target.value)} placeholder="https://" className={FIELD} />
        </div>
      </div>
    </div>
  );
}