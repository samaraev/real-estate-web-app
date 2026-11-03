import React, { useState } from 'react';
import { BadgeCheck, MessageSquare, Phone, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

export default function OwnerCard({ listing, onInquiry, onViewing, isOwner }) {
  const { t } = useI18n();
  const [showPhone, setShowPhone] = useState(false);
  const initials = (listing.owner_name || 'ReDom')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="label-xs mb-3">{listing.agency_name ? t('listing.agentCard') : t('listing.ownerCard')}</p>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold">{listing.owner_name || listing.agency_name}</p>
          {listing.is_verified_owner ? (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-accent">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t('listing.verified')}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">{listing.agency_name || t('roles.owner')}</p>
          )}
        </div>
      </div>

      {showPhone && listing.owner_phone ? (
        <a href={`tel:${listing.owner_phone}`} className="mt-4 block rounded-xl bg-secondary px-4 py-3 text-center font-heading text-base font-semibold">
          {listing.owner_phone}
        </a>
      ) : (
        <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={() => setShowPhone(true)} disabled={!listing.owner_phone && !isOwner}>
          <Phone className="mr-2 h-4 w-4" />
          {t('listing.showPhone')}
        </Button>
      )}

      <Button className="mt-2 w-full rounded-xl" onClick={onInquiry}>
        <MessageSquare className="mr-2 h-4 w-4" />
        {t('listing.write')}
      </Button>
      <Button variant="secondary" className="mt-2 w-full rounded-xl" onClick={onViewing}>
        <CalendarDays className="mr-2 h-4 w-4" />
        {t('listing.bookViewing')}
      </Button>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{t('footer.mockNote')}</p>
    </div>
  );
}