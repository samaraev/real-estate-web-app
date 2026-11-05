import React, { useEffect, useMemo, useState } from 'react';
import { PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewList from './ReviewList';
import ReviewDialog from './ReviewDialog';
import ReviewStars from './ReviewStars';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { averageRating } from '@/lib/reviews';

export default function OwnerReviews({ ownerUserId, ownerName, isOwner }) {
  const { t } = useI18n();
  const { isAuthenticated } = useAccount();
  const [reviews, setReviews] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ownerUserId) return undefined;
    let active = true;
    base44.entities.Review.filter({ target_user_id: ownerUserId, status: 'published' }, { sort: '-created_date', limit: 20 })
      .then((page) => active && setReviews(page.items))
      .catch(() => active && setReviews([]));
    return () => {
      active = false;
    };
  }, [ownerUserId]);

  const average = useMemo(() => averageRating(reviews || []), [reviews]);

  if (!ownerUserId) return null;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">{t('reviews.aboutOwner')}</h2>
        {reviews?.length ? <ReviewStars value={average} /> : null}
      </div>
      <div className="mt-3">
        {reviews === null ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : reviews.length ? (
          <ReviewList reviews={reviews} />
        ) : (
          <p className="text-sm text-muted-foreground">{t('reviews.ownerEmpty')}</p>
        )}
      </div>
      {!isOwner && isAuthenticated ? (
        <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => setOpen(true)}>
          <PenLine className="mr-1 h-3.5 w-3.5" /> {t('reviews.write')}
        </Button>
      ) : null}
      <ReviewDialog
        open={open}
        onOpenChange={setOpen}
        targetUserId={ownerUserId}
        targetRole="owner"
        targetName={ownerName}
      />
    </section>
  );
}