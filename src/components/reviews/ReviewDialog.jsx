import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';

export default function ReviewDialog({ open, onOpenChange, targetUserId, targetRole = 'owner', targetName, onCreated }) {
  const { t } = useI18n();
  const { displayName } = useAccount();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!targetUserId || !text.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.Review.create({
        target_user_id: targetUserId,
        target_role: targetRole,
        author_name: displayName,
        rating,
        text: text.trim(),
        status: 'pending',
      });
      toast({ title: t('reviews.sent') });
      setText('');
      setRating(5);
      onCreated?.(created);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">
            {t('reviews.writeTitle', { name: targetName || t('common.unknown') })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('reviews.ratingLabel')}</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <button key={step} type="button" onClick={() => setRating(step)} aria-label={`${step}`}>
                  <Star className={`h-6 w-6 ${step <= rating ? 'fill-accent text-accent' : 'text-border'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="review-text">{t('reviews.textLabel')}</Label>
            <Textarea
              id="review-text"
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t('reviews.textPlaceholder')}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={saving || !text.trim()}>
            {t('common.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}