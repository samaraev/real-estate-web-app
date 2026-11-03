import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, FilePlus2, Gauge, Plus, ReceiptText, Wrench } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import OwnerDashboard from '@/components/rent/OwnerDashboard';
import TenantDashboard from '@/components/rent/TenantDashboard';
import LeaseCard from '@/components/rent/LeaseCard';
import InvoiceRow from '@/components/rent/InvoiceRow';
import ReadingsPanel from '@/components/rent/ReadingsPanel';
import RequestsPanel from '@/components/rent/RequestsPanel';
import ReportsPanel from '@/components/rent/ReportsPanel';
import LeaseDialog from '@/components/rent/LeaseDialog';
import MeterDialog from '@/components/rent/MeterDialog';
import RequestDialog from '@/components/rent/RequestDialog';
import PayDialog from '@/components/rent/PayDialog';

const TABS = ['dashboard', 'leases', 'invoices', 'readings', 'requests', 'reports'];

export default function Rent() {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [leases, setLeases] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [readings, setReadings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [listings, setListings] = useState([]);

  const [sideOverride, setSideOverride] = useState(null);
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false);
  const [meterOpen, setMeterOpen] = useState(false);
  const [meterLeaseId, setMeterLeaseId] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestLeaseId, setRequestLeaseId] = useState('');
  const [payInvoice, setPayInvoice] = useState(null);
  const [generating, setGenerating] = useState(false);

  const me = user?.id;
  const requestedTab = TABS.includes(params.get('tab')) ? params.get('tab') : 'dashboard';

  const load = useCallback(async () => {
    if (!me) return;
    const party = [{ owner_user_id: me }, { tenant_user_id: me }];
    const [leasePage, invoicePage, readingPage, requestPage, paymentPage, listingPage] = await Promise.all([
      base44.entities.Lease.filter({ $or: party }, { sort: '-created_date', limit: 100 }),
      base44.entities.Invoice.filter({ $or: party }, { sort: '-due_date', limit: 200 }),
      base44.entities.MeterReading.filter({ $or: party }, { sort: '-created_date', limit: 200 }),
      base44.entities.MaintenanceRequest.filter({ $or: party }, { sort: '-created_date', limit: 200 }),
      base44.entities.Payment.filter({ $or: [{ owner_user_id: me }, { payer_user_id: me }] }, { sort: '-created_date', limit: 200 }),
      base44.entities.Listing.filter({ owner_user_id: me, deal_type: 'rent' }, { sort: '-created_date', limit: 50 }),
    ]);
    setLeases(leasePage.items || []);
    setInvoices(invoicePage.items || []);
    setReadings(readingPage.items || []);
    setRequests(requestPage.items || []);
    setPayments(paymentPage.items || []);
    setListings(listingPage.items || []);
  }, [me]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    load();
  }, [isAuthenticated, load, navigateToLogin]);

  const myOwnerLeases = useMemo(() => (leases || []).filter((lease) => lease.owner_user_id === me), [leases, me]);
  const myTenantLeases = useMemo(() => (leases || []).filter((lease) => lease.tenant_user_id === me), [leases, me]);
  const side = sideOverride || (myOwnerLeases.length || !myTenantLeases.length ? 'owner' : 'tenant');
  const tab = side !== 'owner' && requestedTab === 'reports' ? 'dashboard' : requestedTab;

  const sideLeases = side === 'owner' ? myOwnerLeases : myTenantLeases;
  const sideInvoices = useMemo(
    () => invoices.filter((invoice) => (side === 'owner' ? invoice.owner_user_id === me : invoice.tenant_user_id === me)),
    [invoices, side, me]
  );
  const sideReadings = useMemo(
    () => readings.filter((reading) => (side === 'owner' ? reading.owner_user_id === me : reading.tenant_user_id === me)),
    [readings, side, me]
  );
  const sidePaymentList = useMemo(
    () => payments.filter((payment) => (side === 'owner' ? payment.owner_user_id === me : payment.payer_user_id === me)),
    [payments, side, me]
  );
  const leaseIds = useMemo(() => new Set(sideLeases.map((lease) => lease.id)), [sideLeases]);
  const sideRequests = useMemo(
    () => requests.filter((request) => leaseIds.has(request.lease_id) || request.created_by_id === me),
    [requests, leaseIds, me]
  );

  const setTab = (next) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('tab', next);
    setParams(nextParams, { replace: true });
  };

  const generateInvoices = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('rentInvoices', { action: 'generateAll' });
      toast({ title: t('invoice.generated', { count: response.data?.created ?? 0 }) });
      await load();
    } finally {
      setGenerating(false);
    }
  };

  const openMeter = (leaseId = '') => {
    setMeterLeaseId(leaseId);
    setMeterOpen(true);
  };

  const openRequest = (leaseId = '') => {
    setRequestLeaseId(leaseId);
    setRequestOpen(true);
  };

  const visibleTabs = side === 'owner' ? TABS : TABS.filter((item) => item !== 'reports');

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={t('nav.manage')}
        title={t('rent.title')}
        actions={
          side === 'owner' ? (
            <>
              <Button variant="outline" className="rounded-full" onClick={generateInvoices} disabled={generating}>
                <FilePlus2 className="mr-1.5 h-4 w-4" />
                {generating ? t('common.processing') : t('rent.generateNow')}
              </Button>
              <Button className="rounded-full" onClick={() => setLeaseDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />{t('rent.createLease')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="rounded-full" onClick={() => openMeter()} disabled={!myTenantLeases.length}>
                <Gauge className="mr-1.5 h-4 w-4" />{t('meter.add')}
              </Button>
              <Button className="rounded-full" onClick={() => openRequest()} disabled={!myTenantLeases.length}>
                <Plus className="mr-1.5 h-4 w-4" />{t('maintenance.new')}
              </Button>
            </>
          )
        }
      />

      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-secondary/70 p-1">
            {['owner', 'tenant'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSideOverride(value)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  side === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {t(value === 'owner' ? 'rent.ownerSide' : 'rent.tenantSide')}
              </button>
            ))}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5 flex w-full justify-start gap-1 overflow-x-auto rounded-full bg-secondary/60 p-1">
            {visibleTabs.map((item) => (
              <TabsTrigger key={item} value={item} className="rounded-full px-3 text-xs">
                {t(`rent.${item}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {leases === null ? (
          <Loading />
        ) : (
          <>
            {tab === 'dashboard' && side === 'owner' ? (
              <OwnerDashboard
                leases={myOwnerLeases}
                invoices={sideInvoices}
                payments={sidePaymentList}
                onCreateLease={() => setLeaseDialogOpen(true)}
                onGenerate={generateInvoices}
                generating={generating}
              />
            ) : null}

            {tab === 'dashboard' && side === 'tenant' ? (
              <TenantDashboard
                leases={myTenantLeases}
                invoices={sideInvoices}
                readings={sideReadings}
                requests={sideRequests}
                onPay={setPayInvoice}
                onAddReading={() => openMeter()}
                onAddRequest={() => openRequest()}
              />
            ) : null}

            {tab === 'leases' ? (
              sideLeases.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sideLeases.map((lease) => <LeaseCard key={lease.id} lease={lease} side={side} />)}
                </div>
              ) : (
                <EmptyState
                  icon={Building2}
                  title={t('rent.noLeases')}
                  text={side === 'owner' ? t('rent.noLeasesHint') : t('rent.tenantEmptyHint')}
                  actionLabel={side === 'owner' ? t('rent.createLease') : undefined}
                  onAction={side === 'owner' ? () => setLeaseDialogOpen(true) : undefined}
                />
              )
            ) : null}

            {tab === 'invoices' ? (
              sideInvoices.length ? (
                <div className="space-y-2">
                  {sideInvoices.map((invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} side={side} onPay={setPayInvoice} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ReceiptText}
                  title={t('invoice.empty')}
                  text={t('invoice.emptyHint')}
                  actionLabel={side === 'owner' ? t('rent.generateNow') : undefined}
                  onAction={side === 'owner' ? generateInvoices : undefined}
                />
              )
            ) : null}

            {tab === 'readings' ? (
              <div className="space-y-3">
                {sideLeases.length ? (
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => openMeter()}>
                    <Gauge className="mr-1.5 h-3.5 w-3.5" />{t('meter.add')}
                  </Button>
                ) : null}
                <ReadingsPanel readings={sideReadings} leases={sideLeases} side={side} onChanged={load} />
              </div>
            ) : null}

            {tab === 'requests' ? (
              <div className="space-y-3">
                {sideLeases.length ? (
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => openRequest()}>
                    <Wrench className="mr-1.5 h-3.5 w-3.5" />{t('maintenance.new')}
                  </Button>
                ) : null}
                <RequestsPanel
                  requests={sideRequests}
                  leases={sideLeases}
                  side={side}
                  onChanged={load}
                  onAdd={sideLeases.length ? () => openRequest() : undefined}
                />
              </div>
            ) : null}

            {tab === 'reports' && side === 'owner' ? (
              <ReportsPanel payments={sidePaymentList} requests={sideRequests} />
            ) : null}
          </>
        )}
      </div>

      <LeaseDialog
        open={leaseDialogOpen}
        onOpenChange={setLeaseDialogOpen}
        listings={listings}
        onCreated={(lease) => {
          load();
          navigate(`/rent/leases/${lease.id}`);
        }}
      />
      <MeterDialog
        open={meterOpen}
        onOpenChange={setMeterOpen}
        leases={myTenantLeases}
        initialLeaseId={meterLeaseId}
        readings={readings}
        onCreated={load}
      />
      <RequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        leases={myTenantLeases}
        initialLeaseId={requestLeaseId}
        onCreated={load}
      />
      <PayDialog
        open={Boolean(payInvoice)}
        onOpenChange={(open) => { if (!open) setPayInvoice(null); }}
        invoice={payInvoice}
        onPaid={load}
      />
    </div>
  );
}