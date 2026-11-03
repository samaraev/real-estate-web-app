import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileSignature } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

export default function RentJoin() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAccount();
  const { navigateToLogin } = useAuth();
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const accept = async () => {
    setState('loading');
    setError('');
    try {
      await base44.functions.invoke('rentJoin', { leaseId: id });
      toast({ title: t('lease.join.done') });
      navigate(`/rent/leases/${id}`, { replace: true });
    } catch (requestError) {
      const code = requestError?.response?.data?.error;
      if (code === 'email_mismatch') setError(t('lease.join.emailMismatch'));
      else if (code === 'lease_taken') setError(t('lease.join.taken'));
      else if (requestError?.response?.status === 404) setError(t('lease.join.expired'));
      else setError(t('common.error'));
      setState('error');
    }
  };

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('lease.title')} title={t('lease.join.title')} />
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
            <FileSignature className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('lease.join.hint')}</p>

          {error ? <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">{error}</p> : null}

          <div className="mt-6">
            {isAuthenticated ? (
              <Button className="w-full rounded-full" disabled={state === 'loading'} onClick={accept}>
                {state === 'loading' ? t('common.processing') : t('lease.join.accept')}
              </Button>
            ) : (
              <Button className="w-full rounded-full" onClick={() => navigateToLogin(window.location.href)}>
                {t('common.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}