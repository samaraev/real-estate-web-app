import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';

export default function SignDialog({ open, onOpenChange, defaultName = '', onSign }) {
  const { t } = useI18n();
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSign(name.trim());
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{t('docs.signTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="sign-name">{t('docs.nameForSign')}</Label>
          <Input id="sign-name" value={name} onChange={(event) => setName(event.target.value)} />
          <p className="text-xs leading-relaxed text-muted-foreground">{t('docs.signHint')}</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={saving || !name.trim()}>
            {t('docs.sign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}