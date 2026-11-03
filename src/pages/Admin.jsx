import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Shield, Check, X, Search } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';

export default function Admin() {
  const { t, money, date } = useI18n();
  const { isAdmin, isAuthenticated, user } = useAccount();
  const [pending, setPending] = useState(null);
  const [users, setUsers] = useState(null);
  const [reports, setReports] = useState(null);
  const [query, setQuery] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [resolution, setResolution] = useState('');

  const loadAll = useCallback(async () => {
    const [pendingPage, userList, reportPage] = await Promise.all([
      base44.entities.Listing.filter({ status: 'pending' }, { sort: 'created_date', limit: 50 }).catch(() => ({ items: [] })),
      base44.entities.User.list().catch(() => []),
      base44.entities.Report.filter({}, { sort: '-created_date', limit: 50 }).catch(() => ({ items: [] })),
    ]);
    setPending(pendingPage.items || []);
    setUsers(Array.isArray(userList) ? userList : []);
    setReports(reportPage.items || []);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    loadAll();
  }, [isAuthenticated, isAdmin, loadAll]);

  const approve = async (listing) => {
    await base44.entities.Listing.update(listing.id, { status: 'published', moderation_note: '' });
    toast({ title: t('admin.approved') });
    loadAll();
  };

  const reject = async () => {
    if (!rejecting) return;
    await base44.entities.Listing.update(rejecting.id, { status: 'rejected', rejection_reason: reason.trim() });
    toast({ title: t('admin.rejected') });
    setRejecting(null);
    setReason('');
    loadAll();
  };

  const toggleAdmin = async (target) => {
    const nextRole = target.role === 'admin' ? 'user' : 'admin';
    await base44.entities.User.update(target.id, { role: nextRole });
    toast({ title: t('common.saved') });
    loadAll();
  };

  const resolveReport = async (report, status) => {
    await base44.entities.Report.update(report.id, { status, resolution: resolution.trim() });
    setResolution('');
    toast({ title: t('common.saved') });
    loadAll();
  };

  const filteredUsers = useMemo(() => {
    const list = users || [];
    const q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 50);
    return list.filter((item) => `${item.full_name || ''} ${item.email || ''}`.toLowerCase().includes(q)).slice(0, 50);
  }, [users, query]);

  if (!isAuthenticated) return <Loading className="py-24" />;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <EmptyState icon={Shield} title={t('admin.noAccess')} actionLabel={t('common.backHome')} actionTo="/" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('nav.admin')} title={t('admin.title')} />
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <Tabs defaultValue="moderation">
          <TabsList className="mb-5 flex w-full justify-start gap-1 overflow-x-auto rounded-full bg-secondary/60 p-1">
            <TabsTrigger value="moderation" className="rounded-full text-xs">{t('admin.tabs.moderation')}</TabsTrigger>
            <TabsTrigger value="users" className="rounded-full text-xs">{t('admin.tabs.users')}</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full text-xs">{t('admin.tabs.reports')}</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation">
            {pending === null ? (
              <Loading />
            ) : pending.length === 0 ? (
              <EmptyState title={t('admin.queueEmpty')} />
            ) : (
              <ul className="space-y-3">
                {pending.map((listing) => (
                  <li key={listing.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-heading text-sm font-semibold">{listing.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {listing.city} · {money(listing.price, listing.currency)} · {t(`category.${listing.category}`)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {listing.owner_name} · {date(listing.created_date)}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" className="rounded-full" onClick={() => approve(listing)}>
                          <Check className="mr-1 h-3.5 w-3.5" />{t('admin.approve')}
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRejecting(listing)}>
                          <X className="mr-1 h-3.5 w-3.5" />{t('admin.reject')}
                        </Button>
                      </div>
                    </div>
                    {rejecting?.id === listing.id ? (
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="reason">{t('admin.rejectReason')}</Label>
                        <Textarea id="reason" rows={2} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t('admin.rejectPlaceholder')} />
                        <div className="flex gap-2">
                          <Button size="sm" className="rounded-full" onClick={reject}>{t('common.confirm')}</Button>
                          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setRejecting(null)}>{t('common.cancel')}</Button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="users">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.userSearch')} className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
            </div>
            {users === null ? (
              <Loading />
            ) : (
              <ul className="space-y-2">
                {filteredUsers.map((item) => (
                  <li key={item.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.full_name || item.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(item.roles || []).map((role) => (
                          <Badge key={role} variant="secondary" className="rounded-full text-[10px]">{t(`roles.${role}`)}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={item.role === 'admin' ? 'rounded-full bg-accent text-accent-foreground' : 'rounded-full'} variant={item.role === 'admin' ? 'default' : 'outline'}>
                        {t(`roles.${item.role}`)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => toggleAdmin(item)}
                        disabled={item.id === user?.id}
                      >
                        {item.role === 'admin' ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="reports">
            {reports === null ? (
              <Loading />
            ) : reports.length === 0 ? (
              <EmptyState title={t('admin.reportEmpty')} />
            ) : (
              <ul className="space-y-3">
                {reports.map((report) => (
                  <li key={report.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full text-[10px]">{report.target_type}</Badge>
                      <Badge variant="secondary" className="rounded-full text-[10px]">{report.status}</Badge>
                      <span className="text-xs text-muted-foreground">{date(report.created_date)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{report.target_label || report.target_id}</p>
                    <p className="text-sm text-muted-foreground">{t(`reports.reason.${report.reason}`, { defaultValue: report.reason })}{report.comment ? ` · ${report.comment}` : ''}</p>
                    {report.status === 'open' || report.status === 'reviewing' ? (
                      <div className="mt-3 space-y-2">
                        <Textarea rows={2} value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder={t('admin.resolution')} />
                        <div className="flex gap-2">
                          <Button size="sm" className="rounded-full" onClick={() => resolveReport(report, 'resolved')}>{t('admin.resolve')}</Button>
                          <Button size="sm" variant="outline" className="rounded-full" onClick={() => resolveReport(report, 'dismissed')}>{t('admin.dismiss')}</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">{report.resolution}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}