import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { CRM_STAGES } from './LeadBoard';
import { toast } from '@/components/ui/use-toast';

const SOURCES = ['site', 'call', 'telegram', 'xml_feed', 'referral'];
const EMPTY = {
  name: '',
  phone: '',
  email: '',
  source: 'site',
  stage: 'new',
  listingId: '',
  budget: '',
  commission: '',
  followUp: '',
};

export default function LeadDialog({ open, onOpenChange, lead, listings = [], onSaved }) {
  const { t } = useI18n();
  const { user } = useAccount();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!lead) {
      setForm(EMPTY);
      return;
    }
    const budget = Number(lead.budget || 0);
    setForm({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      source: lead.source || 'site',
      stage: lead.stage || 'new',
      listingId: lead.listing_id || '',
      budget: lead.budget ? String(lead.budget) : '',
      commission: budget && lead.commission ? String(Math.round((lead.commission / budget) * 100)) : '',
      followUp: lead.next_follow_up || '',
    });
  }, [open, lead]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const budget = Number(form.budget || 0);
      const pct = Number(form.commission || 0);
      const data = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        source: form.source,
        stage: form.stage,
        listing_id: form.listingId || undefined,
        budget: budget || undefined,
        commission: budget && pct ? Math.round((budget * pct) / 100) : 0,
        next_follow_up: form.followUp || undefined,
      };
      if (lead) {
        await base44.entities.Lead.update(lead.id, data);
        toast({ title: t('crm.saved') });
      } else {
        await base44.entities.Lead.create({ ...data, agent_user_id: user?.id });
        toast({ title: t('crm.created') });
      }
      onSaved?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">
            {lead ? t('crm.editTitle') : t('crm.newLead')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name">{t('crm.form.name')}</Label>
              <Input id="lead-name" value={form.name} onChange={(event) => set({ name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone">{t('crm.form.phone')}</Label>
              <Input id="lead-phone" value={form.phone} onChange={(event) => set({ phone: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">{t('crm.form.email')}</Label>
              <Input id="lead-email" value={form.email} onChange={(event) => set({ email: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-source">{t('crm.form.source')}</Label>
              <select
                id="lead-source"
                value={form.source}
                onChange={(event) => set({ source: event.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {t(`crm.sources.${source}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-stage">{t('crm.form.stage')}</Label>
              <select
                id="lead-stage"
                value={form.stage}
                onChange={(event) => set({ stage: event.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {CRM_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {t(`crm.stages.${stage}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-listing">{t('crm.form.listing')}</Label>
              <select
                id="lead-listing"
                value={form.listingId}
                onChange={(event) => set({ listingId: event.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">{t('crm.listingNone')}</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-budget">{t('crm.form.budget')}</Label>
              <Input
                id="lead-budget"
                type="number"
                min="0"
                value={form.budget}
                onChange={(event) => set({ budget: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-commission">{t('crm.form.commission')}</Label>
              <Input
                id="lead-commission"
                type="number"
                min="0"
                max="20"
                value={form.commission}
                onChange={(event) => set({ commission: event.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="lead-followup">{t('crm.form.followUp')}</Label>
              <Input
                id="lead-followup"
                type="date"
                value={form.followUp}
                onChange={(event) => set({ followUp: event.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={saving || !form.name.trim()}>
            {saving ? t('common.processing') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}