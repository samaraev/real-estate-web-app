import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewStars from '@/components/reviews/ReviewStars';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { averageRating } from '@/lib/reviews';
import usePageMeta from '@/hooks/usePageMeta';

export default function Reviews() {
  const { t } = useI18n();
  const { user } = useAccount();
  const [about, setAbout] = useState(null);
  const [mine, setMine] = useState(null);
  const [tab, setTab] = useState('about');
  usePageMeta({ title: t('reviews.title') });

  const me = user?.id;

  const load = useCallback(async () => {
    if (!me) return;
    const [aboutPage, minePage] = await Promise.all([
      base44.entities.Review.filter({ target_user_id: me }, { sort: '-created_date', limit: 50 }),
      base44.entities.Review.filter({ created_by_id: me }, { sort: '-created_date', limit: 50 }),
    ]);
    setAbout(aboutPage.items);
    setMine(minePage.items);
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);

  const average = useMemo(() => averageRating(about || []), [about]);
  const rows = tab === 'about' ? about : mine;

  return (
    <>
      <PageHeader eyebrow={t('nav.reviews')} title={t('reviews.title')} subtitle={t('reviews.subtitle')} />
      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="mb-5 grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="label-xs">{t('reviews.average')}</p>
            {about?.length ? (
              <p className="mt-1 flex items-center gap-2 font-heading text-xl font-semibold">
                <ReviewStars value={average} /> <span>{t('reviews.count', { count: about.length })}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{t('reviews.noRating')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="label-xs">{t('reviews.byMe')}</p>
            <p className="mt-1 font-heading text-xl font-semibold">{mine?.length || 0}</p>
          </div>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-secondary/60 p-1">
          {[
            { id: 'about', label: t('reviews.aboutMe') },
            { id: 'mine', label: t('reviews.byMe') },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                tab === item.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {rows === null ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={PenLine}
            title={tab === 'about' ? t('reviews.emptyAbout') : t('reviews.emptyByMe')}
            text={tab === 'about' ? t('reviews.emptyAboutHint') : undefined}
            actionLabel={tab === 'about' ? t('nav.agencies') : undefined}
            actionTo={tab === 'about' ? '/agencies' : undefined}
          />
        ) : (
          <ReviewList reviews={rows} showStatus={tab === 'mine'} />
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          {t('reviews.aboutOwner')} — <Link to="/search?deal=sale" className="underline">{t('nav.buy')}</Link>
        </p>
      </div>
    </>
  );
}