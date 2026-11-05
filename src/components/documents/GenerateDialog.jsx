import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { base44 } from '@/api/base44Client';
import { buildDocument } from '@/lib/documents';

const TYPES_BY_KIND = {
  deal: ['sale_contract', 'handover_act'],
  lease: ['lease_contract', 'deposit_receipt', 'handover_act'],
};

const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm';

export default function GenerateDialog({ open, onOpenChange, deals, leases, user, onCreated }) {
  const { t, locale } = useI18n();
  const [source, setSource] = useState('');
  const [type, setType] = useState('sale_contract');
  const [language, setLanguage] = useState(locale === 'en' ? 'en' : 'ru');
  const [saving, setSaving] = useState(false);

  const kind = source.split(':')[0];
  const types = TYPES_BY_KIND[kind] || ['sale_contract'];

  const activeType = types.includes(type) ? type : types[0];
  const deal = useMemo(() => deals.find((item) => `deal:${item.id}` === source), [deals, source]);
  const lease = useMemo(() => leases.find((item) => `lease:${item.id}` === source), [leases, source]);

  const submit = async () => {
    if (!source) return;
    setSaving(true);
    try {
      const built = buildDocument({ type: activeType, language, deal, lease, user });
      const participants = [
        user?.id,
        deal?.buyer_user_id,
        deal?.owner_user_id,
        lease?.owner_user_id,
        lease?.tenant_user_id,
      ].filter(Boolean);
      const created = await base44.entities.Document.create({
        title: built.title,
        type: activeType,
        language,
        deal_id: deal?.id,
        lease_id: lease?.id,
        owner_user_id: user?.id,
        participants: [...new Set(participants)],
        content: built.content,
        status: 'draft',
        signatures: [],
      });
      onCreated(created);
      onOpenChange(false);
      setSource('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{t('docs.newTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="doc-source">{t('docs.source')}</Label>
            <select id="doc-source" value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
              <option value="">{t('docs.needSource')}</option>
              <optgroup label={t('docs.sources.deal')}>
                {deals.map((item) => (
                  <option key={item.id} value={`deal:${item.id}`}>
                    {item.property_title || item.listing_title || item.buyer_name || item.id}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('docs.sources.lease')}>
                {leases.map((item) => (
                  <option key={item.id} value={`lease:${item.id}`}>
                    {item.property_title || item.address || item.id}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-type">{t('docs.title')}</Label>
              <select id="doc-type" value={activeType} onChange={(e) => setType(e.target.value)} className={selectClass}>
                {types.map((item) => (
                  <option key={item} value={item}>
                    {t(`docs.types.${item}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-language">{t('docs.language')}</Label>
              <select id="doc-language" value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
                <option value="ru">{t('docs.ruOfficial')}</option>
                <option value="en">{t('docs.enCourtesy')}</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={saving || !source}>
            {t('docs.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}