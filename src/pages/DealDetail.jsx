import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FileText, XCircle } from 'lucide-react';
import Loading from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import StatusPill from '@/components/rent/StatusPill';
import ChecklistPanel from '@/components/deals/ChecklistPanel';
import NotesPanel from '@/components/deals/NotesPanel';
import EscrowPanel from '@/components/deals/EscrowPanel';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';
import { dealTitle, nextStage, normalizeChecklist, progressOf } from '@/lib/deals';
import { buildDocument } from '@/lib/documents';
import usePageMeta from '@/hooks/usePageMeta';

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, money, locale } = useI18n();
  const { user } = useAccount();
  const [deal, setDeal] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notFound, setNotFound] = useState(false);
  usePageMeta({ title: deal ? dealTitle(deal) : t('deals.title') });

  const load = useCallback(async () => {
    try {
      const [record, docPage] = await Promise.all([
        base44.entities.Deal.get(id),
        base44.entities.Document.filter({ deal_id: id }, { sort: '-created_date', limit: 50 }),
      ]);
      setDeal(record);
      setDocuments(docPage.items);
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notFound) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);

  const patch = async (data) => {
    await base44.entities.Deal.update(deal.id, data);
    setDeal((prev) => ({ ...prev, ...data }));
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl">{t('deals.notFound')}</h1>
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link to="/deals">{t('deals.title')}</Link>
        </Button>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="py-20">
        <Loading />
      </div>
    );
  }

  const { done, total } = progressOf(deal);
  const percent = Math.round((done / total) * 100);

  const toggle = (key) => {
    const checklist = normalizeChecklist(deal.checklist).map((item) =>
      item.key === key ? { ...item, done: !item.done } : item
    );
    patch({ checklist: checklist.map(({ key: stepKey, done }) => ({ key: stepKey, done })) });
  };

  const createDocument = async () => {
    const built = buildDocument({ type: 'sale_contract', language: locale === 'en' ? 'en' : 'ru', deal, user });
    const created = await base44.entities.Document.create({
      title: built.title,
      type: 'sale_contract',
      language: locale === 'en' ? 'en' : 'ru',
      deal_id: deal.id,
      owner_user_id: user?.id,
      participants: [...new Set([user?.id, deal.buyer_user_id, deal.owner_user_id].filter(Boolean))],
      content: built.content,
      status: 'draft',
      signatures: [],
    });
    navigate(`/documents/${created.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-content px-4 pb-16 pt-6 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full">
        <Link to="/deals">
          <ArrowLeft className="mr-1 h-4 w-4" /> {t('deals.title')}
        </Link>
      </Button>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusPill tone={deal.stage === 'won' ? 'green' : deal.stage === 'lost' ? 'red' : 'blue'}>
              {t(`deals.stages.${deal.stage || 'inquiry'}`)}
            </StatusPill>
          </div>
          <h1 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{dealTitle(deal)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('deals.buyer')}: {deal.buyer_name || '—'} · {money(deal.amount, deal.currency || 'RUB')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {deal.stage !== 'won' && deal.stage !== 'lost' ? (
            <Button size="sm" className="rounded-full" onClick={() => patch({ stage: nextStage(deal.stage) })}>
              {t('deals.moveNext')} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : null}
          {deal.stage !== 'lost' ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => patch({ stage: 'lost' })}>
              <XCircle className="mr-1 h-4 w-4" /> {t('deals.markLost')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('deals.progress', { done, total })}</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <ChecklistPanel deal={deal} onToggle={toggle} />
          <NotesPanel
            deal={deal}
            onAdd={(note) => patch({ notes: [...(deal.notes || []), note] })}
          />
        </div>
        <div className="space-y-4">
          <EscrowPanel deal={deal} onChange={(escrow) => patch({ escrow })} />
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-semibold">{t('deals.documents')}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('deals.documentsHint')}</p>
            <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={createDocument}>
              <FileText className="mr-1 h-4 w-4" /> {t('docs.generate')}
            </Button>
            {documents.length ? (
              <ul className="mt-3 space-y-1.5">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <Link to={`/documents/${doc.id}`} className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-sm hover:bg-secondary">
                      <span className="truncate">{doc.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{t(`docs.status.${doc.status || 'draft'}`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}