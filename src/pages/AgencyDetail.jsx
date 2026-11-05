import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Building2, ChartNoAxesColumn, Link2, Mail, MapPin, Phone, Users } from 'lucide-react';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import ListingCard from '@/components/listings/ListingCard';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import usePageMeta from '@/hooks/usePageMeta';

export default function AgencyDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const { user } = useAccount();
  const [agency, setAgency] = useState(undefined);
  const [listings, setListings] = useState([]);
  usePageMeta({ title: agency?.name || t('agency.title') });

  const load = useCallback(async () => {
    try {
      setAgency(await base44.entities.Agency.get(id));
    } catch {
      setAgency(null);
      return;
    }
    const page = await base44.entities.Listing.filter(
      { agency_id: id, status: 'published' },
      { sort: '-created_date', limit: 12 }
    ).catch(() => ({ items: [] }));
    setListings(page.items);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const attachListings = async () => {
    if (!user?.id) return;
    const page = await base44.entities.Listing.filter({ created_by_id: user.id }, { limit: 100 });
    const targets = page.items.filter((item) => item.agency_id !== id);
    if (targets.length) {
      await base44.entities.Listing.bulkUpdate(
        targets.map((item) => ({ id: item.id, agency_id: id, agency_name: agency.name }))
      );
      await base44.entities.Agency.update(id, { listings_count: page.items.length });
      await load();
    }
  };

  if (agency === undefined) {
    return (
      <div className="py-20">
        <Loading />
      </div>
    );
  }

  if (agency === null) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <EmptyState
          icon={Building2}
          title={t('agency.notFound')}
          actionLabel={t('agency.back')}
          actionTo="/agencies"
        />
      </div>
    );
  }

  const members = agency.members || [];
  const isMember = members.some((member) => member.user_id === user?.id) || agency.created_by_id === user?.id;

  return (
    <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8">
      <Link to="/agencies" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> {t('agency.back')}
      </Link>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {agency.is_verified ? (
                <span className="chip border-accent/40 text-accent">
                  <BadgeCheck className="h-3.5 w-3.5" /> {t('agency.verified')}
                </span>
              ) : null}
              <span className="chip">
                <MapPin className="h-3.5 w-3.5" /> {agency.city || t('common.unknown')}
              </span>
              {isMember ? <span className="chip">{t('agency.mine')}</span> : null}
            </div>
            <h1 className="font-display text-2xl leading-tight sm:text-3xl">{agency.name}</h1>
            {agency.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{agency.description}</p>
            ) : null}
          </div>
          {isMember ? (
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full" onClick={attachListings}>
                <Link2 className="mr-1 h-4 w-4" /> {t('agency.attach')}
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/crm">
                  <ChartNoAxesColumn className="mr-1 h-4 w-4" /> {t('agency.openCrm')}
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="label-xs">{t('agency.contacts')}</dt>
            <dd className="mt-1 space-y-1">
              {agency.phone ? (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-1.5 hover:text-accent">
                  <Phone className="h-3.5 w-3.5" /> {agency.phone}
                </a>
              ) : null}
              {agency.email ? (
                <a href={`mailto:${agency.email}`} className="flex items-center gap-1.5 hover:text-accent">
                  <Mail className="h-3.5 w-3.5" /> {agency.email}
                </a>
              ) : null}
              {!agency.phone && !agency.email ? <span className="text-muted-foreground">—</span> : null}
            </dd>
          </div>
          <div>
            <dt className="label-xs">{t('agency.team')}</dt>
            <dd className="mt-1 space-y-1">
              {members.length ? (
                members.map((member) => (
                  <span key={`${member.user_id}-${member.name}`} className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" /> {member.name || t('common.unknown')}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">{t('agency.membersEmpty')}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="label-xs">{t('agency.listings')}</dt>
            <dd className="mt-1">
              {agency.rating ? Number(agency.rating).toFixed(1) : t('agency.ratingNone')} · {agency.listings_count || listings.length}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl">{t('agency.listings')}</h2>
        {listings.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t('agency.listingsEmpty')}</p>
        )}
      </section>
    </div>
  );
}