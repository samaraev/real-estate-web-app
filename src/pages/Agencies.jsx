import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AgencyCard from '@/components/agencies/AgencyCard';
import AgencyDialog from '@/components/agencies/AgencyDialog';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { CITIES } from '@/lib/constants';
import usePageMeta from '@/hooks/usePageMeta';

export default function Agencies() {
  const { t } = useI18n();
  const { isAuthenticated } = useAccount();
  const [agencies, setAgencies] = useState(null);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  usePageMeta({ title: t('agency.title') });

  const load = useCallback(async () => {
    const page = await base44.entities.Agency.list({ sort: '-created_date', limit: 100 });
    setAgencies(page.items);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const rows = agencies || [];
    const q = query.trim().toLowerCase();
    return rows.filter((agency) => {
      const matchesQuery = !q || `${agency.name || ''} ${agency.city || ''}`.toLowerCase().includes(q);
      const matchesCity = city === 'all' || agency.city === city;
      return matchesQuery && matchesCity;
    });
  }, [agencies, query, city]);

  return (
    <>
      <PageHeader
        eyebrow={t('nav.agencies')}
        title={t('agency.title')}
        subtitle={t('agency.subtitle')}
        actions={
          isAuthenticated ? (
            <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> {t('agency.join')}
            </Button>
          ) : null
        }
      />
      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('agency.search')}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-9 rounded-xl border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">{t('agency.allCities')}</option>
            {CITIES.map((item) => (
              <option key={item.id} value={item.name.ru}>
                {item.name.ru}
              </option>
            ))}
          </select>
        </div>

        {agencies === null ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={t('agency.empty')}
            text={t('agency.emptyHint')}
            actionLabel={isAuthenticated ? t('agency.joinTitle') : undefined}
            onAction={isAuthenticated ? () => setDialogOpen(true) : undefined}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        )}
      </div>

      <AgencyDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={load} />
    </>
  );
}