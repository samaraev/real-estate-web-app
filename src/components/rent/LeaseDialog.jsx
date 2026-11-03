import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';

const todayIso = () => new Date().toISOString().slice(0, 10);

const yearAhead = (iso) => {
  const date = new Date(`${iso || todayIso()}T00:00:00`);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const emptyForm = () => ({
  listingId: '',
  tenant_name: '',
  tenant_phone: '',
  tenant_email: '',
  start_date: todayIso(),
  end_date: yearAhead(todayIso()),
  rent_amount: '',
  due_day: '5',
  deposit: '',
  deposit_paid: false,
  utilities_rule: 'included',
  utilities_cap: '',
  late_fee: '0',
  indexation: '0',
});

export default function LeaseDialog({ open, onOpenChange, listings = [], onCreated }) {
  const { t } = useI18n();
  const { user } = useAccount();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickListing = (listingId) => {
    const listing = listings.find((item) => item.id === listingId);
    setForm((prev) => ({
      ...prev,
      listingId,
      rent_amount: listing?.price ? String(listing.price) : prev.rent_amount,
      deposit: listing?.deposit ? String(listing.deposit) : prev.deposit,
      utilities_rule: listing?.utilities_included === false ? 'separate' : 'included',
    }));
  };

  const listing = listings.find((item) => item.id === form.listingId);
  const valid = Boolean(listing && form.tenant_name.trim() && form.start_date && Number(form.rent_amount) > 0);

  const submit = async () => {
    if (!valid || !user?.id) return;
    setSaving(true);
    try {
      const lease = await base44.entities.Lease.create({
        property_id: listing.property_id || '',
        listing_id: listing.id,
        property_title: listing.title,
        address: listing.address || '',
        city: listing.city || '',
        owner_user_id: user.id,
        tenant_user_id: '',
        tenant_name: form.tenant_name.trim(),
        tenant_phone: form.tenant_phone.trim(),
        tenant_email: form.tenant_email.trim().toLowerCase(),
        start_date: form.start_date,
        end_date: form.end_date,
        rent_amount: Number(form.rent_amount),
        currency: 'RUB',
        due_day: Number(form.due_day) || 5,
        deposit: Number(form.deposit) || 0,
        deposit_paid: Boolean(form.deposit_paid),
        utilities_rule: form.utilities_rule,
        utilities_cap: form.utilities_rule === 'capped' ? Number(form.utilities_cap) || 0 : 0,
        late_fee_rule: { percent: Number(form.late_fee) || 0 },
        indexation_rule: { percent: Number(form.indexation) || 0 },
        status: 'pending_tenant',
        split: [],
        documents: [],
        move_in_checklist: [],
        move_out_checklist: [],
        signed_by_owner: true,
        signed_by_tenant: false,
      });
      toast({ title: t('lease.created') });
      setForm(emptyForm());
      onOpenChange(false);
      onCreated?.(lease);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t('lease.new')}</DialogTitle>
          <DialogDescription>{t('lease.tenantInviteHint')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block">{t('lease.property')}</Label>
            {listings.length ? (
              <Select value={form.listingId} onValueChange={pickListing}>
                <SelectTrigger><SelectValue placeholder={t('lease.selectProperty')} /></SelectTrigger>
                <SelectContent>
                  {listings.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title} · {item.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                {t('lease.selectProperty')} — <Link to="/listings/new" className="text-primary underline">{t('nav.listProperty')}</Link>
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">{t('lease.tenantName')}</Label>
            <Input value={form.tenant_name} onChange={(event) => setField('tenant_name', event.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t('lease.tenantPhone')}</Label>
            <Input value={form.tenant_phone} onChange={(event) => setField('tenant_phone', event.target.value)} placeholder="+7 900 000-00-00" />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block">{t('lease.tenantEmail')}</Label>
            <Input type="email" value={form.tenant_email} onChange={(event) => setField('tenant_email', event.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block">{t('lease.startDate')}</Label>
            <Input type="date" value={form.start_date} onChange={(event) => { setField('start_date', event.target.value); setField('end_date', yearAhead(event.target.value)); }} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t('lease.endDate')}</Label>
            <Input type="date" value={form.end_date} onChange={(event) => setField('end_date', event.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block">{t('lease.rentAmount')}</Label>
            <Input type="number" min="0" value={form.rent_amount} onChange={(event) => setField('rent_amount', event.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t('lease.dueDay')}</Label>
            <Input type="number" min="1" max="28" value={form.due_day} onChange={(event) => setField('due_day', event.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block">{t('lease.deposit')}</Label>
            <Input type="number" min="0" value={form.deposit} onChange={(event) => setField('deposit', event.target.value)} />
          </div>
          <div className="flex items-end gap-3 pb-1">
            <Switch checked={form.deposit_paid} onCheckedChange={(checked) => setField('deposit_paid', checked)} />
            <span className="text-sm">{t('lease.depositPaid')}</span>
          </div>

          <div>
            <Label className="mb-1.5 block">{t('lease.utilitiesRule')}</Label>
            <Select value={form.utilities_rule} onValueChange={(value) => setField('utilities_rule', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="included">{t('lease.utilities.included')}</SelectItem>
                <SelectItem value="separate">{t('lease.utilities.separate')}</SelectItem>
                <SelectItem value="capped">{t('lease.utilities.capped')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.utilities_rule === 'capped' ? (
            <div>
              <Label className="mb-1.5 block">{t('lease.utilitiesCap')}</Label>
              <Input type="number" min="0" value={form.utilities_cap} onChange={(event) => setField('utilities_cap', event.target.value)} />
            </div>
          ) : <div className="hidden sm:block" />}

          <div>
            <Label className="mb-1.5 block">{t('lease.lateFee')}</Label>
            <Input type="number" min="0" step="0.01" value={form.late_fee} onChange={(event) => setField('late_fee', event.target.value)} />
            <p className="mt-1 text-[11px] text-muted-foreground">{t('lease.lateFeeHint')}</p>
          </div>
          <div>
            <Label className="mb-1.5 block">{t('lease.indexation')}</Label>
            <Input type="number" min="0" step="0.1" value={form.indexation} onChange={(event) => setField('indexation', event.target.value)} />
            <p className="mt-1 text-[11px] text-muted-foreground">{t('lease.indexationHint')}</p>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:justify-end">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button className="rounded-full" disabled={!valid || saving} onClick={submit}>
            {saving ? t('common.processing') : t('lease.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}