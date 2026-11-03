import React, { useMemo, useState } from 'react';
import { Calculator, Landmark } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/i18n';
import { toast } from '@/components/ui/use-toast';
import usePageMeta from '@/hooks/usePageMeta';

const BANKS = [
  { id: 'sber', rate: 9.6, fee: 0, family: 6.0 },
  { id: 'vtb', rate: 10.1, fee: 0, family: 6.0 },
  { id: 'alfa', rate: 9.9, fee: 15000, family: null },
  { id: 'domrf', rate: 10.4, fee: 0, family: 5.7 },
];

const annuity = (amount, annualRate, years) => {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return amount / months;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
};

export default function Mortgage() {
  const { t, money } = useI18n();
  const [price, setPrice] = useState(12000000);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(20);
  const [family, setFamily] = useState(false);

  usePageMeta({ title: t('mortgage.title'), description: t('mortgage.subtitle') });

  const loan = Math.max(price - (price * down) / 100, 0);

  const offers = useMemo(
    () =>
      BANKS.map((bank) => {
        const rate = family && bank.family ? bank.family : bank.rate;
        const monthly = annuity(loan, rate, years);
        return { ...bank, rate, monthly, total: monthly * years * 12 };
      }).sort((a, b) => a.monthly - b.monthly),
    [loan, years, family]
  );

  const best = offers[0];

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('nav.mortgage')} title={t('mortgage.title')} subtitle={t('mortgage.subtitle')} />
      <div className="mx-auto grid w-full max-w-content gap-4 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <Label>{t('mortgage.price')}</Label>
                <span className="font-heading text-sm font-semibold">{money(price)}</span>
              </div>
              <Input
                type="number"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value) || 0)}
                className="mt-2"
                inputMode="numeric"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>{t('mortgage.downPayment')}</Label>
                <span className="font-heading text-sm font-semibold">{down}% · {money((price * down) / 100)}</span>
              </div>
              <Slider value={[down]} min={0} max={70} step={5} onValueChange={(next) => setDown(next[0])} className="mt-3" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>{t('mortgage.term')}</Label>
                <span className="font-heading text-sm font-semibold">{years}</span>
              </div>
              <Slider value={[years]} min={1} max={30} step={1} onValueChange={(next) => setYears(next[0])} className="mt-3" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={family} onChange={(event) => setFamily(event.target.checked)} className="h-4 w-4 rounded border-border" />
              {t('mortgage.family')}
            </label>

            <div className="rounded-2xl bg-secondary/60 p-4">
              <p className="label-xs">{t('mortgage.monthly')}</p>
              <p className="mt-1 font-display text-3xl">{best ? money(Math.round(best.monthly)) : '—'}</p>
              <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between"><dt>{t('mortgage.totalAmount')}</dt><dd className="text-foreground">{best ? money(Math.round(best.total)) : '—'}</dd></div>
                <div className="flex justify-between"><dt>{t('mortgage.totalInterest')}</dt><dd className="text-foreground">{best ? money(Math.round(best.total - loan)) : '—'}</dd></div>
                <div className="flex justify-between"><dt>{t('mortgage.requiredIncome')}</dt><dd className="text-foreground">{best ? money(Math.round((best.monthly * 100) / 40)) : '—'}</dd></div>
              </dl>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{t('mortgage.mockNote')}</p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
            <Calculator className="h-4 w-4 text-accent" />
            <p className="text-sm font-medium">{t('mortgage.offers')}</p>
          </div>
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 font-heading text-sm font-semibold">
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    {t(`mortgage.banks.${offer.id}`)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('mortgage.offer.rate')}: <span className="text-foreground">{offer.rate}%</span>
                    {offer.family ? ` · ${t('mortgage.family')}: ${offer.family}%` : ''}
                    {offer.fee ? ` · ${t('mortgage.offer.fee')}: ${money(offer.fee)}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm font-semibold">{money(Math.round(offer.monthly))}</p>
                  <p className="text-[11px] text-muted-foreground">{t('mortgage.offer.monthly')}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full rounded-full"
                onClick={() => toast({ title: t('common.saved'), description: `${t(`mortgage.banks.${offer.id}`)} · ${offer.rate}%` })}
              >
                {t('mortgage.offer.choose')}
              </Button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}