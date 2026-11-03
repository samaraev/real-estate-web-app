import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, FilePlus2, Printer, RefreshCw, XCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';
import StatusPill from '@/components/rent/StatusPill';
import InvoiceRow from '@/components/rent/InvoiceRow';
import ReadingsPanel from '@/components/rent/ReadingsPanel';
import RequestsPanel from '@/components/rent/RequestsPanel';
import { currentPeriod, leaseTone } from '@/lib/rent';

const Term = ({ label, value }) => (
  <div>
    <p className="label-xs">{label}</p>
    <p className="mt-0.5 text-sm">{value || '—'}</p>
  </div>
);

export default function LeaseDetail() {
  const { t, money, date } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAccount();

  const [lease, setLease] = useState(undefined);
  const [invoices, setInvoices] = useState([]);
  const [readings, setReadings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [checklistDrafts, setChecklistDrafts] = useState({});
  const [showLink, setShowLink] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const record = await base44.entities.Lease
      .get(id)
      .catch((error) => (error.status === 404 || error.status === 403 ? null : Promise.reject(error)));
    setLease(record);
    if (!record) return;

    const [invoicePage, readingPage, requestPage] = await Promise.all([
      base44.entities.Invoice.filter({ lease_id: id }, { sort: '-due_date', limit: 100 }),
      base44.entities.MeterReading.filter({ lease_id: id }, { sort: '-created_date', limit: 100 }),
      base44.entities.MaintenanceRequest.filter({ lease_id: id }, { sort: '-created_date', limit: 100 }),
    ]);
    setInvoices(invoicePage.items || []);
    setReadings(readingPage.items || []);
    setRequests(requestPage.items || []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (lease !== null) return undefined;
    const tag = document.createElement('meta');
    tag.name = 'prerender-status-code';
    tag.content = '404';
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, [lease]);

  const isOwner = Boolean(lease && user?.id && lease.owner_user_id === user.id);
  const isTenant = Boolean(lease && user?.id && lease.tenant_user_id === user.id);
  const side = isOwner ? 'owner' : 'tenant';

  const patch = async (changes, message) => {
    await base44.entities.Lease.update(lease.id, changes);
    setLease((prev) => ({ ...prev, ...changes }));
    if (message) toast({ title: message });
  };

  const generateInvoice = async () => {
    setBusy(true);
    try {
      const response = await base44.functions.invoke('rentInvoices', {
        action: 'generate',
        leaseId: lease.id,
        period: currentPeriod(),
      });
      const { exists, invoice } = response.data || {};
      if (!exists) toast({ title: t('invoice.created') });
      await load();
      if (invoice?.id) navigate(`/rent/invoices/${invoice.id}`);
    } finally {
      setBusy(false);
    }
  };

  const renew = async () => {
    const current = lease.end_date ? new Date(`${lease.end_date}T00:00:00`) : new Date();
    const base = current.getTime() > Date.now() ? current : new Date();
    base.setFullYear(base.getFullYear() + 1);
    await patch({ end_date: base.toISOString().slice(0, 10), status: 'active' }, t('lease.renewed'));
  };

  const toggleChecklist = async (field, index) => {
    const list = Array.isArray(lease[field]) ? [...lease[field]] : [];
    list[index] = { ...list[index], done: !list[index].done };
    await patch({ [field]: list });
  };

  const addChecklistItem = async (field) => {
    const label = (checklistDrafts[field] || '').trim();
    if (!label) return;
    const list = [...(Array.isArray(lease[field]) ? lease[field] : []), { label, done: false }];
    setChecklistDrafts((prev) => ({ ...prev, [field]: '' }));
    await patch({ [field]: list });
  };

  if (lease === undefined) {
    return <div className="mx-auto max-w-content px-4 py-10"><Loading /></div>;
  }

  if (lease === null) {
    return (
      <div className="mx-auto max-w-content px-4 py-10">
        <EmptyState
          icon={XCircle}
          title={t('lease.notFound')}
          actionLabel={t('rent.title')}
          actionTo="/rent"
        />
      </div>
    );
  }

  const place = [lease.city, lease.address].filter(Boolean).join(', ');
  const joinUrl = `${window.location.origin}/rent/join/${lease.id}`;

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={t('lease.title')}
        title={lease.property_title || lease.address || t('lease.title')}
        subtitle={place}
        actions={<StatusPill tone={leaseTone[lease.status]}>{t(`lease.status.${lease.status}`)}</StatusPill>}
      />

      <div className="mx-auto w-full max-w-content space-y-5 px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/rent"><ArrowLeft className="mr-1 h-4 w-4" />{t('rent.title')}</Link>
          </Button>
          {isOwner ? (
            <>
              <Button size="sm" className="rounded-full" onClick={generateInvoice} disabled={busy}>
                <FilePlus2 className="mr-1 h-3.5 w-3.5" />{t('lease.generateInvoice')}
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowLink((prev) => !prev)}>
                <Copy className="mr-1 h-3.5 w-3.5" />{t('lease.shareLink')}
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={renew}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" />{t('lease.renew')}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full text-destructive">
                    <XCircle className="mr-1 h-3.5 w-3.5" />{t('lease.terminate')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('lease.terminate')}</AlertDialogTitle>
                    <AlertDialogDescription>{lease.property_title}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => patch({ status: 'terminated' })}>{t('common.confirm')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : null}
          {isOwner && !lease.signed_by_owner ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => patch({ signed_by_owner: true })}>
              <Check className="mr-1 h-3.5 w-3.5" />{t('lease.sign')}
            </Button>
          ) : null}
          {isTenant && !lease.signed_by_tenant ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => patch({ signed_by_tenant: true })}>
              <Check className="mr-1 h-3.5 w-3.5" />{t('lease.sign')}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => window.print()}>
            <Printer className="mr-1 h-3.5 w-3.5" />{t('common.print')}
          </Button>
        </div>

        {showLink ? (
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="label-xs mb-1.5">{t('lease.shareLink')}</p>
            <Input readOnly value={joinUrl} onFocus={(event) => event.target.select()} />
          </div>
        ) : null}

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-heading text-sm font-semibold">{t('lease.details')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Term label={t('lease.rentAmount')} value={money(lease.rent_amount, lease.currency)} />
            <Term label={t('lease.dueDay')} value={lease.due_day ? String(lease.due_day) : '—'} />
            <Term label={t('lease.deposit')} value={money(lease.deposit, lease.currency)} />
            <Term label={t('lease.depositPaid')} value={lease.deposit_paid ? t('common.yes') : t('common.no')} />
            <Term label={t('lease.startDate')} value={date(lease.start_date)} />
            <Term label={t('lease.endDate')} value={date(lease.end_date)} />
            <Term
              label={t('lease.utilitiesRule')}
              value={`${t(`lease.utilities.${lease.utilities_rule || 'included'}`)}${lease.utilities_rule === 'capped' ? ` · ${money(lease.utilities_cap)}` : ''}`}
            />
            <Term
              label={t('lease.lateFee')}
              value={lease.late_fee_rule?.percent ? `${lease.late_fee_rule.percent}% / ${t('common.period')}` : '—'}
            />
            <Term
              label={t('lease.indexation')}
              value={lease.indexation_rule?.percent ? `${lease.indexation_rule.percent}%` : '—'}
            />
            <Term
              label={t('lease.signed')}
              value={`${lease.signed_by_owner ? t('roles.owner') : '—'} / ${lease.signed_by_tenant ? t('lease.tenant') : '—'}`}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-heading text-sm font-semibold">{t('lease.parties')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="label-xs">{t('roles.owner')}</p>
              <p className="mt-0.5 text-sm">{isOwner ? (user.full_name || user.email) : '—'}</p>
            </div>
            <div>
              <p className="label-xs">{t('lease.tenant')}</p>
              <p className="mt-0.5 text-sm">{lease.tenant_name || '—'}</p>
              <p className="text-xs text-muted-foreground">{lease.tenant_phone || ''}</p>
              <p className="text-xs text-muted-foreground">{lease.tenant_email || ''}</p>
            </div>
          </div>
        </section>

        {['move_in_checklist', 'move_out_checklist'].map((field) => {
          const list = Array.isArray(lease[field]) ? lease[field] : [];
          return (
            <section key={field} className="rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-2 font-heading text-sm font-semibold">
                {t(field === 'move_in_checklist' ? 'lease.moveIn' : 'lease.moveOut')} · {t('lease.checklist')}
              </h2>
              {list.length ? (
                <ul className="space-y-1">
                  {list.map((item, index) => (
                    <li key={`${field}-${index}`}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(item.done)}
                          onChange={() => toggleChecklist(field, index)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <span className={item.done ? 'text-muted-foreground line-through' : ''}>{item.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">{t('lease.checklistEmpty')}</p>
              )}
              <div className="mt-3 flex gap-2">
                <Input
                  className="h-9"
                  value={checklistDrafts[field] || ''}
                  onChange={(event) => setChecklistDrafts((prev) => ({ ...prev, [field]: event.target.value }))}
                  placeholder={t('lease.addChecklistItem')}
                />
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => addChecklistItem(field)}>
                  {t('common.add')}
                </Button>
              </div>
            </section>
          );
        })}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">{t('rent.invoices')}</h2>
            <button type="button" onClick={() => navigate('/rent?tab=invoices')} className="text-xs text-muted-foreground hover:text-foreground">
              {t('common.viewAll')}
            </button>
          </div>
          {invoices.length ? (
            <div className="space-y-2">
              {invoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} side={side} />)}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              {t('invoice.empty')}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-semibold">{t('meter.title')}</h2>
          <ReadingsPanel readings={readings} leases={[lease]} side={side} onChanged={load} />
        </section>

        <section>
          <h2 className="mb-2 font-heading text-sm font-semibold">{t('maintenance.title')}</h2>
          <RequestsPanel requests={requests} leases={[lease]} side={side} onChanged={load} />
        </section>
      </div>
    </div>
  );
}