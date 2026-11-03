import React, { useMemo, useState } from 'react';
import { ImageIcon, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/common/EmptyState';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import StatusPill from './StatusPill';
import { priorityTone, requestTone } from '@/lib/rent';

const STATUSES = ['new', 'in_progress', 'waiting', 'done', 'cancelled'];

export default function RequestsPanel({ requests = [], leases = [], side = 'owner', onChanged, onAdd }) {
  const { t, money, date } = useI18n();
  const { displayName } = useAccount();
  const [drafts, setDrafts] = useState({});
  const leaseById = useMemo(() => new Map(leases.map((lease) => [lease.id, lease])), [leases]);

  const setStatus = async (request, status) => {
    await base44.entities.MaintenanceRequest.update(request.id, { status });
    onChanged?.();
  };

  const saveCost = async (request, value) => {
    const cost = Number(value);
    if (!Number.isFinite(cost) || cost === Number(request.cost || 0)) return;
    await base44.entities.MaintenanceRequest.update(request.id, { cost });
    onChanged?.();
  };

  const addComment = async (request) => {
    const body = (drafts[request.id] || '').trim();
    if (!body) return;
    const comments = [
      ...(Array.isArray(request.comments) ? request.comments : []),
      { author_name: displayName || '', body, created_at: new Date().toISOString() },
    ];
    await base44.entities.MaintenanceRequest.update(request.id, { comments });
    setDrafts((prev) => ({ ...prev, [request.id]: '' }));
    onChanged?.();
  };

  const openFile = async (uri) => {
    if (!uri) return;
    if (/^https?:/.test(uri)) {
      window.open(uri, '_blank', 'noopener');
      return;
    }
    const { data } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
    if (data?.signed_url) window.open(data.signed_url, '_blank', 'noopener');
  };

  if (!requests.length) {
    return (
      <EmptyState
        icon={Wrench}
        title={t('maintenance.empty')}
        text={t('maintenance.emptyHint')}
        actionLabel={onAdd ? t('maintenance.new') : undefined}
        onAction={onAdd}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((request) => {
        const lease = leaseById.get(request.lease_id);
        const comments = Array.isArray(request.comments) ? request.comments : [];
        return (
          <li key={request.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={requestTone[request.status]}>{t(`maintenance.status.${request.status}`)}</StatusPill>
              <StatusPill tone={priorityTone[request.priority]}>{t(`maintenance.priorities.${request.priority}`)}</StatusPill>
              {lease ? <span className="truncate text-[11px] text-muted-foreground">{lease.property_title}</span> : null}
              {request.created_date ? <span className="text-[11px] text-muted-foreground">· {date(request.created_date)}</span> : null}
            </div>

            <p className="mt-2 font-heading text-base font-semibold">{request.title}</p>
            {request.description ? (
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{request.description}</p>
            ) : null}
            {request.cost ? (
              <p className="mt-1 text-xs text-muted-foreground">{t('maintenance.cost')}: {money(request.cost)}</p>
            ) : null}

            {Array.isArray(request.photos) && request.photos.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {request.photos.map((photo, index) => (
                  <Button key={`${request.id}-photo-${index}`} variant="outline" size="sm" className="rounded-full" onClick={() => openFile(photo)}>
                    <ImageIcon className="mr-1 h-3.5 w-3.5" />{index + 1}
                  </Button>
                ))}
              </div>
            ) : null}

            {side === 'owner' ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Select value={request.status} onValueChange={(value) => setStatus(request, value)}>
                  <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{t(`maintenance.status.${status}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">{t('maintenance.cost')}</span>
                  <Input
                    type="number"
                    defaultValue={request.cost || ''}
                    className="h-8 w-28"
                    onBlur={(event) => saveCost(request, event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <p className="label-xs">{t('maintenance.comments')}</p>
              {comments.length ? (
                <ul className="space-y-1.5">
                  {comments.map((comment, index) => (
                    <li key={`${request.id}-comment-${index}`} className="rounded-xl bg-secondary/60 px-3 py-2 text-xs">
                      <span className="font-medium">{comment.author_name || '—'}</span>
                      <span className="text-muted-foreground"> · {date(comment.created_at)}</span>
                      <p className="mt-0.5 whitespace-pre-line text-foreground/90">{comment.body}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex gap-2">
                <Input
                  value={drafts[request.id] || ''}
                  onChange={(event) => setDrafts((prev) => ({ ...prev, [request.id]: event.target.value }))}
                  placeholder={t('maintenance.addComment')}
                  className="h-9"
                />
                <Button size="sm" className="rounded-full" onClick={() => addComment(request)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}