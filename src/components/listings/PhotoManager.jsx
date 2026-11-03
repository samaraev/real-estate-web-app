import React, { useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function PhotoManager({ photos, onChange }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: t('errors.fileTooLarge'), variant: 'destructive' });
          continue;
        }
        // Listing photos are public marketing assets, so they live in public storage.
        const { file_url: url } = await base44.integrations.Core.UploadPublicFile({ file });
        uploaded.push({ file_url: url });
      }
      onChange([...photos, ...uploaded]);
      toast({ title: t('form.photosUploaded') });
    } catch {
      toast({ title: t('errors.uploadFailed'), variant: 'destructive' });
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const remove = (index) => onChange(photos.filter((_, i) => i !== index));
  const makeCover = (index) => {
    const next = [...photos];
    const [item] = next.splice(index, 1);
    onChange([item, ...next]);
  };
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="label-xs">{t('form.photos')}</p>
        <span className="text-[11px] text-muted-foreground">{t('form.photosHint')}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <div key={`${photo.file_url}-${index}`} className="group relative overflow-hidden rounded-xl border border-border">
            <img src={photo.file_url} alt="" className="aspect-[4/3] w-full object-cover" />
            {index === 0 ? (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                {t('form.makeCover')}
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-primary/80 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-0.5">
                <button type="button" onClick={() => move(index, -1)} aria-label={t('form.moveLeft')} className="rounded p-1 text-primary-foreground"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(index, 1)} aria-label={t('form.moveRight')} className="rounded p-1 text-primary-foreground"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex gap-0.5">
                {index !== 0 ? (
                  <button type="button" onClick={() => makeCover(index)} aria-label={t('form.makeCover')} className="rounded p-1 text-primary-foreground"><Star className="h-3.5 w-3.5" /></button>
                ) : null}
                <button type="button" onClick={() => remove(index)} aria-label={t('common.delete')} className="rounded p-1 text-primary-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="text-[11px]">{t('form.addPhoto')}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={upload} disabled={busy} />
        </label>
      </div>
    </div>
  );
}