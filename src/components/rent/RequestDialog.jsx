import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';

const PRIORITIES = ['low', 'normal', 'urgent'];

export default function RequestDialog({ open, onOpenChange, leases = [], initialLeaseId, onCreated }) {
  const { t } = useI18n();
  const { user } = useAccount();
  const [leaseId, setLeaseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLeaseId(initialLeaseId || leases[0]?.id || '');
    setTitle('');
    setDescription('');
    setPriority('normal');
    setFiles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialLeaseId]);

  const lease = leases.find((item) => item.id === leaseId);
  const valid = Boolean(lease && title.trim());

  const submit = async () => {
    if (!valid || !user?.id) return;
    setSaving(true);
    try {
      const photos = [];
      for (const file of files) {
        const { file_uri: fileUri } = await base44.integrations.Core.UploadPrivateFile({ file });
        photos.push(fileUri);
      }
      await base44.entities.MaintenanceRequest.create({
        lease_id: lease.id,
        property_title: lease.property_title || lease.address || '',
        owner_user_id: lease.owner_user_id || '',
        tenant_user_id: lease.tenant_user_id || user.id,
        title: title.trim(),
        description: description.trim(),
        photos,
        priority,
        status: 'new',
        comments: [],
      });
      toast({ title: t('maintenance.created') });
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
          <DialogTitle className="font-display text-xl">{t('maintenance.new')}</DialogTitle>
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
            <Label className="mb-1.5 block">{t('maintenance.subject')}</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('maintenance.subjectPlaceholder')} />
          </div>

          <div>
            <Label className="mb-1.5 block">{t('maintenance.description')}</Label>
            <Textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>

          <div>
            <Label className="mb-1.5 block">{t('maintenance.priority')}</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((item) => (
                  <SelectItem key={item} value={item}>{t(`maintenance.priorities.${item}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block">{t('maintenance.addPhoto')}</Label>
            <Input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:justify-end">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button className="rounded-full" disabled={!valid || saving} onClick={submit}>
            {saving ? t('common.processing') : t('maintenance.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}