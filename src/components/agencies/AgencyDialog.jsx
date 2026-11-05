import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { CITIES } from '@/lib/constants';
import { toast } from '@/components/ui/use-toast';

const EMPTY = { name: '', city: CITIES[0].name.ru, phone: '', email: '', description: '' };

export default function AgencyDialog({ open, onOpenChange, onSaved }) {
  const { t } = useI18n();
  const { user, displayName } = useAccount();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Agency.create({
        name: form.name.trim(),
        city: form.city,
        phone: form.phone.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        members: [{ user_id: user?.id, name: displayName, role: 'agent' }],
        listings_count: 0,
        is_verified: false,
      });
      toast({ title: t('agency.created') });
      setForm(EMPTY);
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
          <DialogTitle className="font-display text-xl font-normal">{t('agency.joinTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="agency-name">{t('agency.form.name')}</Label>
            <Input id="agency-name" value={form.name} onChange={(event) => set({ name: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="agency-city">{t('agency.form.city')}</Label>
              <select
                id="agency-city"
                value={form.city}
                onChange={(event) => set({ city: event.target.value })}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {CITIES.map((item) => (
                  <option key={item.id} value={item.name.ru}>
                    {item.name.ru}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agency-phone">{t('agency.form.phone')}</Label>
              <Input id="agency-phone" value={form.phone} onChange={(event) => set({ phone: event.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="agency-email">{t('agency.form.email')}</Label>
              <Input id="agency-email" value={form.email} onChange={(event) => set({ email: event.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="agency-description">{t('agency.form.description')}</Label>
            <Textarea
              id="agency-description"
              rows={3}
              value={form.description}
              onChange={(event) => set({ description: event.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('agency.joinedNote')}</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={saving || !form.name.trim()}>
            {t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}