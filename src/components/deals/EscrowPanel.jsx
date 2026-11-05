import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import escrowProvider from '@/lib/providers/escrow';
import StatusPill from '@/components/rent/StatusPill';

const TONE = { none: 'neutral', opened: 'amber', funded: 'blue', released: 'green', refunded: 'purple' };
const NEXT_ACTION = { none: 'open', opened: 'fund', funded: 'release' };

export default function EscrowPanel({ deal, onChange }) {
  const { t, money } = useI18n();
  const [busy, setBusy] = useState(false);
  const escrow = deal.escrow || {};
  const status = escrow.status || 'none';
  const action = NEXT_ACTION[status];

  const run = async (step) => {
    setBusy(true);
    try {
      if (step === 'open') {
        onChange(await escrowProvider.open({ dealId: deal.id, amount: deal.amount, ownerId: deal.owner_user_id }));
      } else {
        onChange(await escrowProvider[step](escrow));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" /> {t('deals.escrow')}
        </h2>
        <StatusPill tone={TONE[status] || 'neutral'}>{t(`deals.escrowStatus.${status}`)}</StatusPill>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{money(escrow.amount ?? deal.amount, deal.currency || 'RUB')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {action ? (
          <Button size="sm" className="rounded-full" disabled={busy} onClick={() => run(action)}>
            {t(`deals.escrowActions.${action}`)}
          </Button>
        ) : null}
        {status === 'funded' ? (
          <Button size="sm" variant="outline" className="rounded-full" disabled={busy} onClick={() => run('refund')}>
            {t('deals.escrowActions.refund')}
          </Button>
        ) : null}
      </div>
    </section>
  );
}