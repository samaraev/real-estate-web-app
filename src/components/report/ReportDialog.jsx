import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

const REASONS = ['spam', 'fraud', 'wrong_data', 'offensive', 'other'];

export default function ReportDialog({ targetType, targetId, targetLabel, triggerClassName }) {
  const { t } = useI18n();
  const { navigateToLogin, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await base44.entities.Report.create({
        target_type: targetType,
        target_id: targetId,
        target_label: targetLabel,
        reason,
        comment: comment.trim(),
        status: 'open',
      });
      toast({ title: t('common.saved'), description: t('listing.report') });
      setOpen(false);
      setComment('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (isAuthenticated ? setOpen(true) : navigateToLogin())}
        className={triggerClassName || 'inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'}
      >
        <Flag className="h-3.5 w-3.5" />
        {t('listing.report')}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal">{t('listing.report')}</DialogTitle>
            <DialogDescription>{targetLabel}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>{t('common.status')}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REASONS.map((item) => (
                    <SelectItem key={item} value={item}>{t(`reports.reason.${item}`, { defaultValue: item })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-comment">{t('common.comment')}</Label>
              <Textarea id="report-comment" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button className="rounded-full" onClick={submit} disabled={busy}>{busy ? t('common.processing') : t('common.send')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}