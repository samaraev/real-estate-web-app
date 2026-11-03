import React, { useMemo } from 'react';
import { Check, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import StatusPill from './StatusPill';
import { readingTone } from '@/lib/rent';

const openFile = async (uri) => {
  if (!uri) return;
  if (/^https?:/.test(uri)) {
    window.open(uri, '_blank', 'noopener');
    return;
  }
  const { data } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
  if (data?.signed_url) window.open(data.signed_url, '_blank', 'noopener');
};

export default function ReadingsPanel({ readings = [], leases = [], side = 'owner', onChanged }) {
  const { t, money, date, monthLabel } = useI18n();
  const leaseById = useMemo(() => new Map(leases.map((lease) => [lease.id, lease])), [leases]);

  const setStatus = async (reading, status) => {
    await base44.entities.MeterReading.update(reading.id, { status });
    onChanged?.();
  };

  const saveCost = async (reading, value) => {
    const cost = Number(value);
    if (!Number.isFinite(cost) || cost === Number(reading.cost || 0)) return;
    await base44.entities.MeterReading.update(reading.id, { cost });
    onChanged?.();
  };

  if (!readings.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {t('meter.empty')}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {readings.map((reading) => {
        const lease = leaseById.get(reading.lease_id);
        return (
          <li key={reading.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={readingTone[reading.status]}>{t(`meter.status.${reading.status}`)}</StatusPill>
              <span className="text-sm font-medium">{t(`meter.kind.${reading.kind}`)}</span>
              {reading.period ? (
                <span className="text-[11px] text-muted-foreground">{monthLabel(new Date(`${reading.period}-01T00:00:00`))}</span>
              ) : null}
              {lease ? <span className="truncate text-[11px] text-muted-foreground">· {lease.property_title}</span> : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span>{t('meter.previous')}: <span className="text-muted-foreground">{reading.previous_value || 0}</span></span>
              <span className="font-semibold">{reading.value}</span>
              {reading.cost ? <span className="text-xs text-muted-foreground">{t('meter.cost')}: {money(reading.cost)}</span> : null}
              {reading.created_date ? <span className="text-[11px] text-muted-foreground">{date(reading.created_date)}</span> : null}
            </div>

            {reading.note ? <p className="mt-1 text-xs text-muted-foreground">{reading.note}</p> : null}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {reading.photo_url ? (
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => openFile(reading.photo_url)}>
                  <ImageIcon className="mr-1 h-3.5 w-3.5" />{t('common.open')}
                </Button>
              ) : null}

              {side === 'owner' ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">{t('meter.cost')}</span>
                    <Input
                      type="number"
                      defaultValue={reading.cost || ''}
                      className="h-8 w-24"
                      onBlur={(event) => saveCost(reading, event.target.value)}
                    />
                  </div>
                  {reading.status === 'submitted' ? (
                    <>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(reading, 'approved')}>
                        <Check className="mr-1 h-3.5 w-3.5" />{t('meter.approve')}
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => setStatus(reading, 'rejected')}>
                        <X className="mr-1 h-3.5 w-3.5" />{t('meter.reject')}
                      </Button>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}