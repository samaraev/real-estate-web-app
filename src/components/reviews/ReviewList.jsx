import React from 'react';
import ReviewStars from './ReviewStars';
import { useI18n } from '@/i18n';

export default function ReviewList({ reviews = [], showStatus = false }) {
  const { t, date } = useI18n();

  if (!reviews.length) return null;

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-sm font-semibold">{review.author_name || t('common.unknown')}</p>
            <ReviewStars value={review.rating} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {date(review.created_date)}
            {review.target_role ? ` · ${t(`reviews.roles.${review.target_role}`)}` : ''}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{review.text}</p>
          {showStatus && review.status !== 'published' ? (
            <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              {t(`reviews.status.${review.status || 'pending'}`)}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}