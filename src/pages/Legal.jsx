import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { useI18n } from '@/i18n';
import usePageMeta from '@/hooks/usePageMeta';

export default function Legal() {
  const { page } = useParams();
  const { t, date } = useI18n();
  const isPrivacy = page === 'privacy';
  const title = t(isPrivacy ? 'legal.privacy' : 'legal.terms');

  usePageMeta({ title, description: t(isPrivacy ? 'legal.privacyText' : 'legal.termsText') });

  return (
    <div className="pb-20">
      <PageHeader eyebrow={t('footer.legal')} title={title} subtitle={t('legal.updated', { date: date(new Date()) })} />
      <article className="mx-auto w-full max-w-2xl px-4 text-sm leading-relaxed text-foreground/85 sm:px-6">
        <p>{t(isPrivacy ? 'legal.privacyText' : 'legal.termsText')}</p>
        <p className="mt-4 text-xs text-muted-foreground">{t('legal.authoritativeRu')}</p>
      </article>
    </div>
  );
}