import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { base44 } from '@/api/base44Client';
import { defaultChecklist } from '@/lib/deals';

const EMPTY = { listingId: '', buyerName: '', buyerPhone: '', amount: '', commission: '', followUp: '' };

export default function DealDialog({ open, onOpenChange, listings = [], onCreated }) {
  const { t, money } = useI18n();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const listing = useMemo(() => listings.find((item) => item.id === form.listingId), [listings, form.listingId]);
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const pickListing = (id) => {
    const next = listings.find((item) => item.id === id);
    set({ listingId: id, amount: next?.price ? String(next.price) : form.amount });
  };

  const submit = async () => {
    const amount = Number(form.amount || listing?.price || 0);
    if (!amount) return;
    setSaving(true);
    try {
      const pct = Number(form.commission || 0);
      const created = await base44.entities.Deal.create({
        listing_id: listing?.id,
        listing_title: listing?.title,
        property_title: listing?.title,
        owner_user_id: listing?.created_by_id,
        buyer_name: form.buyerName,
        buyer_phone: form.buyerPhone,
        amount,
        currency: listing?.currency || 'RUB',
        stage: 'inquiry',
        checklist: defaultChecklist(),
        notes: [],
        commission: pct ? Math.round((amount * pct) / 100) : 0,
        next_follow_up: form.followUp || undefined,
      });
      onCreated(created);
      setForm(EMPTY);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{t('deals.form.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="deal-listing">{t('deals.form.listing')}</Label>
            <select
              id="deal-listing"
              value={form.listingId}
              onChange={(event) => pickListing(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">{t('deals.form.listingNone')}</option>
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} — {money(item.price, item.currency || 'RUB')}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="deal-buyer">{t('deals.form.buyerName')}</Label>
              <Input id="deal-buyer" value={form.buyerName} onChange={(e) => set({ buyerName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-phone">{t('deals.form.buyerPhone')}</Label>
              <Input id="deal-phone" value={form.buyerPhone} onChange={(e) => set({ buyerPhone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-amount">{t('deals.form.amount')}</Label>
              <Input id="deal-amount" type="number" min="0" value={form.amount} onChange={(e) => set({ amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-commission">{t('deals.form.commission')}</Label>
              <Input id="deal-commission" type="number" min="0" max="20" value={form.commission} onChange={(e) => set({ commission: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="deal-followup">{t('deals.form.nextFollowUp')}</Label>
              <Input id="deal-followup" type="date" value={form.followUp} onChange={(e) => set({ followUp: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('deals.form.hint')}</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={saving || !Number(form.amount || listing?.price || 0)}>
            {t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}