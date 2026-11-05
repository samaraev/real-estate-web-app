import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartNoAxesColumn, Plus } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Stat from '@/components/rent/Stat';
import { Button } from '@/components/ui/button';
import LeadBoard from '@/components/crm/LeadBoard';
import LeadDialog from '@/components/crm/LeadDialog';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';
import usePageMeta from '@/hooks/usePageMeta';

export default function Crm() {
  const { t, money } = useI18n();
  const { user } = useAccount();
  const [leads, setLeads] = useState(null);
  const [listings, setListings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  usePageMeta({ title: t('crm.title') });

  const me = user?.id;

  const load = useCallback(async () => {
    if (!me) return;
    const [leadPage, listingPage] = await Promise.all([
      base44.entities.Lead.filter({}, { sort: '-created_date', limit: 200 }),
      base44.entities.Listing.filter({ created_by_id: me }, { sort: '-created_date', limit: 100 }),
    ]);
    setLeads(leadPage.items);
    setListings(listingPage.items);
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const rows = leads || [];
    const open = rows.filter((lead) => !['won', 'lost'].includes(lead.stage));
    return {
      open: open.length,
      pipeline: open.reduce((sum, lead) => sum + Number(lead.budget || 0), 0),
      won: rows.filter((lead) => lead.stage === 'won').length,
      commission: rows
        .filter((lead) => lead.stage === 'won')
        .reduce((sum, lead) => sum + Number(lead.commission || 0), 0),
    };
  }, [leads]);

  const move = async (lead, stage) => {
    await base44.entities.Lead.update(lead.id, { stage });
    setLeads((prev) => prev.map((item) => (item.id === lead.id ? { ...item, stage } : item)));
    toast({ title: t('crm.saved') });
  };

  const openLead = (lead) => {
    setEditing(lead);
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow={t('nav.crm')}
        title={t('crm.title')}
        actions={
          <Button
            className="rounded-full"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> {t('crm.newLead')}
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label={t('crm.stats.open')} value={stats.open} />
          <Stat label={t('crm.stats.pipeline')} value={money(stats.pipeline)} />
          <Stat label={t('crm.stats.won')} value={stats.won} tone="positive" />
          <Stat label={t('crm.stats.commission')} value={money(stats.commission)} />
        </div>

        {leads === null ? (
          <Loading />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={ChartNoAxesColumn}
            title={t('crm.empty')}
            actionLabel={t('crm.newLead')}
            onAction={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          />
        ) : (
          <LeadBoard leads={leads} onMove={move} onOpen={openLead} />
        )}
      </div>

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={editing}
        listings={listings}
        onSaved={load}
      />
    </>
  );
}