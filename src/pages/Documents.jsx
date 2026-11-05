import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import DocumentRow from '@/components/documents/DocumentRow';
import GenerateDialog from '@/components/documents/GenerateDialog';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { DOC_TYPES } from '@/lib/documents';
import usePageMeta from '@/hooks/usePageMeta';

export default function Documents() {
  const { t } = useI18n();
  const { user } = useAccount();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(null);
  const [deals, setDeals] = useState([]);
  const [leases, setLeases] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  usePageMeta({ title: t('docs.title') });

  const me = user?.id;

  const load = useCallback(async () => {
    if (!me) return;
    const [docPage, dealPage, leasePage] = await Promise.all([
      base44.entities.Document.filter(
        { $or: [{ created_by_id: me }, { owner_user_id: me }, { participants: me }] },
        { sort: '-created_date', limit: 100 }
      ),
      base44.entities.Deal.filter(
        { $or: [{ created_by_id: me }, { owner_user_id: me }, { buyer_user_id: me }, { agent_user_id: me }] },
        { sort: '-updated_date', limit: 100 }
      ),
      base44.entities.Lease.filter({ $or: [{ owner_user_id: me }, { tenant_user_id: me }] }, { sort: '-created_date', limit: 100 }),
    ]);
    setDocuments(docPage.items);
    setDeals(dealPage.items);
    setLeases(leasePage.items);
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const rows = documents || [];
    return typeFilter === 'all' ? rows : rows.filter((doc) => doc.type === typeFilter);
  }, [documents, typeFilter]);

  return (
    <>
      <PageHeader
        eyebrow={t('nav.documents')}
        title={t('docs.title')}
        actions={
          <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
            <FilePlus2 className="mr-1 h-4 w-4" /> {t('docs.generate')}
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="mb-4">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 rounded-full border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">{t('common.all')}</option>
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`docs.types.${type}`)}
              </option>
            ))}
          </select>
        </div>

        {documents === null ? (
          <div className="pt-8">
            <Loading />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FilePlus2}
            title={t('docs.empty')}
            text={t('docs.emptyHint')}
            actionLabel={t('docs.generate')}
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <div className="space-y-2">
            {visible.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>

      <GenerateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deals={deals}
        leases={leases}
        user={user}
        onCreated={(created) => navigate(`/documents/${created.id}`)}
      />
    </>
  );
}