import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';

export default function PartnerDialog({ partner, open, onOpenChange }) {
  const { t } = useI18n();
  const { user } = useAccount();
  const [form, setForm] = useState({ name: user?.full_name || '', phone: user?.phone || '', message: '' });
  const [busy, setBusy] = useState(false);

  if (!partner) return null;

  const submit = async () => {
    if (!form.message.trim()) return;
    setBusy(true);
    try {
      await base44.entities.Inquiry.create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: user?.email || '',
        message: `${partner.name}: ${form.message.trim()}`,
        status: 'new',
        source: 'partner',
      });
      toast({ title: t('partners.booked') });
      setForm((prev) => ({ ...prev, message: '' }));
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('partners.bookTitle')}</DialogTitle>
          <DialogDescription>{partner.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="partner-name" className="mb-1.5 block text-xs text-muted-foreground">
              {t('common.name')}
            </Label>
            <Input
              id="partner-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="partner-phone" className="mb-1.5 block text-xs text-muted-foreground">
              {t('common.phone')}
            </Label>
            <Input
              id="partner-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="partner-message" className="mb-1.5 block text-xs text-muted-foreground">
              {t('common.comment')}
            </Label>
            <Textarea
              id="partner-message"
              rows={4}
              placeholder={t('partners.needMessage')}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">{t('partners.requestHint')}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button className="rounded-full" onClick={submit} disabled={busy || !form.message.trim()}>
            {t('common.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}