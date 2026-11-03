import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { METER_KINDS } from '@/lib/constants';
import { currentPeriod } from '@/lib/rent';
import { toast } from '@/components/ui/use-toast';

export default function MeterDialog({ open, onOpenChange, leases = [], initialLeaseId, readings = [], onCreated }) {
  const { t } = useI18n();
  const { user } = useAccount();
  const [leaseId, setLeaseId] = useState('');
  const [kind, setKind] = useState('electricity');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLeaseId(initialLeaseId || leases[0]?.id || '');
    setKind('electricity');
    setValue('');
    setNote('');
    setFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialLeaseId]);

  const lease = leases.find((item) => item.id === leaseId);

  const previous = useMemo(() => {
    const list = readings.filter((reading) => reading.lease_id === leaseId && reading.kind === kind && reading.status !== 'rejected');
    return list.length ? Math.max(...list.map((reading) => Number(reading.value || 0))) : 0;
  }, [readings, leaseId, kind]);

  const valid = Boolean(lease) && Number(value) > previous;

  const submit = async () => {
    if (!valid || !user?.id) return;
    setSaving(true);
    try {
      let photoUrl = '';
      if (file) {
        const { file_uri: fileUri } = await base44.integrations.Core.UploadPrivateFile({ file });
        photoUrl = fileUri;
      }
      await base44.entities.MeterReading.create({
        lease_id: lease.id,
        owner_user_id: lease.owner_user_id || '',
        tenant_user_id: lease.tenant_user_id || user.id,
        kind,
        period: currentPeriod(),
        value: Number(value),
        previous_value: previous,
        photo_url: photoUrl,
        cost: 0,
        status: 'submitted',
        note: note.trim(),
      });
      toast({ title: t('meter.submitted') });
      onOpenChange(false);
      onCreated?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t('meter.add')}</DialogTitle>
          <DialogDescription>{lease?.property_title || ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {leases.length > 1 ? (
            <div>
              <Label className="mb-1.5 block">{t('lease.property')}</Label>
              <Select value={leaseId} onValueChange={setLeaseId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {leases.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.property_title || item.address}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div>
            <Label className="mb-1.5 block">{t('meter.title')}</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {METER_KINDS.map((item) => (
                  <SelectItem key={item} value={item}>{t(`meter.kind.${item}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block">{t('meter.value')} · {t('meter.unit')}</Label>
            <Input type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} />
            <p className="mt-1 text-[11px] text-muted-foreground">{t('meter.previous')}: {previous}</p>
          </div>

          <div>
            <Label className="mb-1.5 block">{t('meter.photo')}</Label>
            <Input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </div>

          <div>
            <Label className="mb-1.5 block">{t('invoice.note')}</Label>
            <Input value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:justify-end">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button className="rounded-full" disabled={!valid || saving} onClick={submit}>
            {saving ? t('common.processing') : t('meter.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}