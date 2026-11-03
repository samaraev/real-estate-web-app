import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';

export default function InquiryDialog({ open, onOpenChange, listing }) {
  const { t } = useI18n();
  const { user, isAuthenticated, addRole } = useAccount();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '',
    message: '',
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.message.trim()) return;
    setBusy(true);
    try {
      await base44.entities.Inquiry.create({
        listing_id: listing.id,
        listing_title: listing.title,
        owner_user_id: listing.owner_user_id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: user?.email || '',
        message: form.message.trim(),
        status: 'new',
        source: 'listing',
      });

      if (listing.owner_user_id) {
        base44.functions
          .invoke('notify', {
            userId: listing.owner_user_id,
            type: 'messages',
            body: form.message.trim().slice(0, 160),
            link: '/messages',
          })
          .catch(() => {});
      }

      if (isAuthenticated && listing.owner_user_id) {
        const participants = [user.id, listing.owner_user_id].filter(Boolean);
        const conversation = await base44.entities.Conversation.create({
          listing_id: listing.id,
          listing_title: listing.title,
          participants,
          participant_names: {
            [user.id]: user.full_name || user.email,
            [listing.owner_user_id]: listing.owner_name || '',
          },
          last_message: form.message.trim(),
          last_message_at: new Date().toISOString(),
          unread: { [listing.owner_user_id]: 1 },
        });
        await base44.entities.Message.create({
          conversation_id: conversation.id,
          participants,
          body: form.message.trim(),
          read_by: [user.id],
        });
        if (!user.roles?.includes('buyer') && !user.roles?.includes('renter')) {
          await addRole(listing.deal_type === 'rent' ? 'renter' : 'buyer');
        }
        toast({ title: t('inquiry.sent') });
        onOpenChange(false);
        navigate(`/messages?c=${conversation.id}`);
        return;
      }

      toast({ title: t('inquiry.sent'), description: t('inquiry.consent') });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{t('inquiry.title')}</DialogTitle>
          <DialogDescription className="line-clamp-1">{listing?.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="inquiry-name">{t('inquiry.name')}</Label>
            <Input id="inquiry-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inquiry-phone">{t('inquiry.phone')}</Label>
            <Input
              id="inquiry-phone"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="+7 (999) 123-45-67"
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inquiry-message">{t('inquiry.message')}</Label>
            <Textarea
              id="inquiry-message"
              rows={4}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder={t('inquiry.messagePlaceholder')}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{t('inquiry.consent')}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button className="rounded-full" onClick={submit} disabled={busy || !form.message.trim()}>
            {busy ? t('common.processing') : t('inquiry.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}