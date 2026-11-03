import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';

export default function ViewingDialog({ open, onOpenChange, listing }) {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAccount();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!date) return;
    setBusy(true);
    try {
      const start = new Date(`${date}T${time || '12:00'}:00`);
      const end = new Date(start.getTime() + 45 * 60000);
      await base44.entities.Viewing.create({
        listing_id: listing.id,
        listing_title: listing.title,
        owner_user_id: listing.owner_user_id,
        slot_start: start.toISOString(),
        slot_end: end.toISOString(),
        status: 'requested',
        comment: comment.trim(),
        contact_phone: user?.phone || '',
      });
      if (listing.owner_user_id) {
        base44.functions
          .invoke('notify', {
            userId: listing.owner_user_id,
            type: 'viewings',
            body: listing.title,
            link: '/viewings',
          })
          .catch(() => {});
      }
      toast({ title: t('viewings.booked'), description: t('viewings.reminder') });
      onOpenChange(false);
      setDate('');
      setComment('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{t('viewings.bookTitle')}</DialogTitle>
          <DialogDescription className="line-clamp-1">{listing?.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="viewing-date">{t('common.date')}</Label>
              <Input id="viewing-date" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="viewing-time">{t('common.period')}</Label>
              <Input id="viewing-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="viewing-comment">{t('viewings.comment')}</Label>
            <Textarea id="viewing-comment" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} />
          </div>
          {isAuthenticated && user?.phone ? (
            <p className="text-[11px] text-muted-foreground">{t('viewings.reminder')}</p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button className="rounded-full" onClick={submit} disabled={busy || !date}>
            {busy ? t('common.processing') : t('viewings.book')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}