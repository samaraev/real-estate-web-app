import React, { useCallback, useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import Loading from '@/components/common/Loading';
import PlanCard from '@/components/pricing/PlanCard';
import BoostPanel from '@/components/pricing/BoostPanel';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { PLANS, planQuota, periodEnd } from '@/lib/plans';
import paymentsProvider from '@/lib/providers/payments';
import { toast } from '@/components/ui/use-toast';
import usePageMeta from '@/hooks/usePageMeta';

export default function Pricing() {
  const { t, money, date } = useI18n();
  const { user, isAuthenticated, displayName } = useAccount();
  const [subscription, setSubscription] = useState(null);
  const [busy, setBusy] = useState(false);
  usePageMeta({ title: t('pricing.title') });

  const me = user?.id;

  const load = useCallback(async () => {
    if (!me) return;
    const page = await base44.entities.Subscription.filter({ user_id: me }, { sort: '-created_date', limit: 1 });
    setSubscription(page.items[0] || null);
  }, [me]);

  useEffect(() => {
    load();
  }, [load]);

  const currentPlan = subscription?.plan || 'free';

  const choose = async (planId, price) => {
    if (!me) return;
    setBusy(true);
    try {
      const intent = await paymentsProvider.createIntent({ amount: price, method: 'card', payerName: displayName });
      const paid = price ? await paymentsProvider.confirm(intent) : intent;
      const data = {
        user_id: me,
        plan: planId,
        status: 'active',
        listing_quota: planQuota(planId),
        amount: price,
        currency: 'RUB',
        period_end: periodEnd(),
        payment_ref: paid.id,
      };
      if (subscription) await base44.entities.Subscription.update(subscription.id, data);
      else await base44.entities.Subscription.create(data);
      await load();
      toast({ title: t('pricing.activated') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow={t('nav.pricing')} title={t('pricing.title')} subtitle={t('pricing.subtitle')} />
      <div className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6">
        <div className="mb-5 rounded-2xl border border-border bg-card p-4">
          <p className="label-xs">{t('pricing.currentPlan')}</p>
          {isAuthenticated ? (
            subscription ? (
              <div className="mt-1">
                <p className="font-heading text-lg font-semibold">{t(`pricing.plans.${currentPlan}.name`)}</p>
                <p className="text-xs text-muted-foreground">
                  {subscription.period_end ? t('pricing.until', { date: date(subscription.period_end) }) : ''} ·{' '}
                  {t('pricing.quota', { count: subscription.listing_quota || planQuota(currentPlan) })}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{t('pricing.noPlan')}</p>
            )
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{t('pricing.needLogin')}</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              planId={plan.id}
              price={plan.price}
              isCurrent={isAuthenticated && currentPlan === plan.id}
              busy={busy}
              onChoose={choose}
            />
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {t('pricing.paymentNote')} {t('pricing.feeNote', { percent: DEFAULT_SETTINGS.fee_percent })}
        </p>

        {isAuthenticated ? <BoostPanel /> : null}
      </div>
    </>
  );
}