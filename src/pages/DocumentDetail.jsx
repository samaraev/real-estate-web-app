import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileDown, PenLine, Send, Languages } from 'lucide-react';
import Loading from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import StatusPill from '@/components/rent/StatusPill';
import { STATUS_TONE } from '@/components/documents/DocumentRow';
import SignDialog from '@/components/documents/SignDialog';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { toast } from '@/components/ui/use-toast';
import { buildDocument, statusAfterSignature } from '@/lib/documents';
import esignProvider from '@/lib/providers/esign';
import usePageMeta from '@/hooks/usePageMeta';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, dateTime, locale } = useI18n();
  const { user, displayName } = useAccount();
  const [doc, setDoc] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  usePageMeta({ title: doc?.title || t('docs.title') });

  const load = useCallback(async () => {
    try {
      setDoc(await base44.entities.Document.get(id));
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
    await base44.entities.Document.update(doc.id, data);
    setDoc((prev) => ({ ...prev, ...data }));
  };

  const sign = async (name) => {
    const signature = await esignProvider.sign({ documentId: doc.id, userId: user?.id, name });
    const signatures = [...(doc.signatures || []), signature];
    await patch({ signatures, status: statusAfterSignature(signatures, doc.participants) });
    toast({ title: t('docs.signed') });
  };

  const sendToSign = async () => {
    await esignProvider.requestSignature({ documentId: doc.id, participantIds: doc.participants || [] });
    await patch({ status: 'sent' });
    toast({ title: t('docs.sentToSign') });
  };

  const copyEn = async () => {
    const [deal, lease] = await Promise.all([
      doc.deal_id ? base44.entities.Deal.get(doc.deal_id).catch(() => null) : null,
      doc.lease_id ? base44.entities.Lease.get(doc.lease_id).catch(() => null) : null,
    ]);
    const built = buildDocument({ type: doc.type, language: 'en', deal, lease, user });
    const created = await base44.entities.Document.create({
      title: built.title,
      type: doc.type,
      language: 'en',
      deal_id: doc.deal_id,
      lease_id: doc.lease_id,
      owner_user_id: user?.id,
      participants: doc.participants || [],
      content: built.content,
      status: 'draft',
      signatures: [],
    });
    toast({ title: t('docs.enCreated') });
    navigate(`/documents/${created.id}`);
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl">{t('docs.notFound')}</h1>
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link to="/documents">{t('docs.backToList')}</Link>
        </Button>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="py-20">
        <Loading />
      </div>
    );
  }

  const content = doc.content || {};
  const sections = content.sections || [];
  const parties = content.parties || [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full">
          <Link to="/documents">
            <ArrowLeft className="mr-1 h-4 w-4" /> {t('docs.backToList')}
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => window.print()}>
            <FileDown className="mr-1 h-4 w-4" /> {t('common.print')}
          </Button>
          {doc.status === 'draft' ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={sendToSign}>
              <Send className="mr-1 h-4 w-4" /> {t('docs.sendToSign')}
            </Button>
          ) : null}
          {doc.language === 'ru' && doc.status !== 'signed' ? (
            <Button size="sm" variant="outline" className="rounded-full" onClick={copyEn}>
              <Languages className="mr-1 h-4 w-4" /> {t('docs.copyEn')}
            </Button>
          ) : null}
          <Button size="sm" className="rounded-full" onClick={() => setSignOpen(true)}>
            <PenLine className="mr-1 h-4 w-4" /> {t('docs.sign')}
          </Button>
        </div>
      </div>

      <div className="no-print mt-3 flex items-center gap-2">
        <StatusPill tone={STATUS_TONE[doc.status] || 'neutral'}>{t(`docs.status.${doc.status || 'draft'}`)}</StatusPill>
        <span className="text-xs text-muted-foreground">
          {t(`docs.types.${doc.type}`)} · {String(doc.language || 'ru').toUpperCase()}
        </span>
      </div>

      <article className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-8">
        <h1 className="font-display text-xl leading-tight sm:text-2xl">{content.title || doc.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('common.date')}: {dateTime(content.preparedAt || doc.created_date)}
        </p>

        {parties.length ? (
          <section className="mt-6">
            <h2 className="label-xs">{content.partiesHeading || t('docs.parties')}</h2>
            <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {parties.map((party) => (
                <div key={party.role} className="text-sm">
                  <dt className="text-xs text-muted-foreground">{party.role}</dt>
                  <dd className="font-medium">{party.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {sections.map((section, index) => (
          <section key={section.heading} className="mt-5">
            <h2 className="font-heading text-sm font-semibold">
              {index + 1}. {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex} className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-8 border-t border-border pt-4">
          <h2 className="label-xs">{t('docs.signatures')}</h2>
          {(doc.signatures || []).length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {doc.signatures.map((signature, index) => (
                <li key={`${signature.at}-${index}`} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{signature.name}</span>
                  <span className="text-xs text-muted-foreground">{dateTime(signature.at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t('docs.noSignatures')}</p>
          )}
          {content.note ? <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{content.note}</p> : null}
        </section>
      </article>

      <SignDialog open={signOpen} onOpenChange={setSignOpen} defaultName={displayName} onSign={sign} />
    </div>
  );
}