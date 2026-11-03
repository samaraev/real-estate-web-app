import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { toast } from '@/components/ui/use-toast';

export default function SaveSearchDialog({ open, onOpenChange, filters }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await base44.entities.SavedSearch.create({ name: name.trim(), filters, alerts_enabled: true });
      toast({ title: t('search.searchSaved'), description: name.trim() });
      setName('');
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{t('search.saveSearch')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="search-name">{t('search.saveSearchName')}</Label>
          <Input
            id="search-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('search.searchNamePlaceholder')}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button className="rounded-full" onClick={submit} disabled={busy || !name.trim()}>
            {busy ? t('common.processing') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}