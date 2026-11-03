import React, { useEffect, useState } from 'react';
import { BadgeCheck, Check, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useI18n, LOCALES } from '@/i18n';
import { useAccount } from '@/lib/AccountContext';
import { APP_ROLES } from '@/lib/constants';
import { smsProvider } from '@/lib/providers/messaging';
import { toast } from '@/components/ui/use-toast';
import useTheme from '@/hooks/useTheme';

const CHANNELS = ['inapp', 'email', 'telegram'];
const NOTIFY_TYPES = ['rent', 'messages', 'viewings', 'marketing'];
const DEFAULT_NOTIFY = {
  'inapp.rent': true, 'inapp.messages': true, 'inapp.viewings': true, 'inapp.marketing': false,
  'email.rent': true, 'email.messages': false, 'email.viewings': true, 'email.marketing': false,
  'telegram.rent': true, 'telegram.messages': true, 'telegram.viewings': true, 'telegram.marketing': false,
};

export default function Settings() {
  const { t, locale, setLocale } = useI18n();
  const { user, isAuthenticated, roles, updateAccount, addRole, switchRole, saving } = useAccount();
  const { theme, setTheme } = useTheme();
  const { navigateToLogin } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', telegram_username: '', currency: 'RUB' });
  const [notify, setNotify] = useState(DEFAULT_NOTIFY);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      telegram_username: user.telegram_username || '',
      currency: user.currency || 'RUB',
    });
    setNotify({ ...DEFAULT_NOTIFY, ...(user.notify || {}) });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={t('errors.loginRequired')}
        actionLabel={t('header.login')}
        onAction={() => navigateToLogin()}
      />
    );
  }

  const saveProfile = async () => {
    await updateAccount({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      telegram_username: form.telegram_username.trim(),
      currency: form.currency,
    });
    toast({ title: t('settings.saved') });
  };

  const setLanguage = async (next) => {
    setLocale(next);
    await updateAccount({ language: next });
  };

  const setChannel = async (key, value) => {
    const next = { ...notify, [key]: value };
    setNotify(next);
    await updateAccount({ notify: next });
  };

  const sendCode = () => {
    smsProvider.send({ phone: form.phone, text: t('auth.devCode') });
    setCodeSent(true);
    toast({ title: t('auth.codeSent', { phone: form.phone || '—' }), description: t('auth.devCode') });
  };

  const confirmCode = async () => {
    if (code.trim() !== '123456') {
      toast({ title: t('settings.wrongCode'), variant: 'destructive' });
      return;
    }
    await updateAccount({ phone_verified: true });
    setVerifyOpen(false);
    setCode('');
    toast({ title: t('settings.verified') });
  };

  return (
    <div className="pb-16">
      <PageHeader eyebrow={t('nav.settings')} title={t('settings.title')} />
      <div className="mx-auto grid w-full max-w-content gap-4 px-4 sm:px-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">{t('settings.profile')}</h2>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">{t('settings.fullName')}</Label>
              <Input id="full_name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('settings.phone')}</Label>
              <div className="flex gap-2">
                <Input id="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+7 (999) 123-45-67" inputMode="tel" />
                {user?.phone_verified ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-3 text-xs text-accent">
                    <BadgeCheck className="h-4 w-4" /> {t('common.yes')}
                  </span>
                ) : (
                  <Button variant="outline" type="button" onClick={() => setVerifyOpen(true)}>{t('settings.verify')}</Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{t('settings.phoneHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telegram">{t('settings.telegram')}</Label>
              <Input id="telegram" value={form.telegram_username} onChange={(event) => setForm({ ...form, telegram_username: event.target.value })} placeholder="@username" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('settings.language')}</Label>
                <div className="flex gap-1.5">
                  {Object.entries(LOCALES).map(([code, meta]) => (
                    <Button
                      key={code}
                      type="button"
                      variant={locale === code ? 'default' : 'outline'}
                      className="flex-1 rounded-lg"
                      onClick={() => setLanguage(code)}
                    >
                      {meta.label} · {meta.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('settings.currency')}</Label>
                <Select value={form.currency} onValueChange={(next) => setForm({ ...form, currency: next })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['RUB', 'USD', 'EUR'].map((currency) => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">{t('settings.currencyHint')}</p>
              </div>
            </div>
            <Button className="rounded-full" onClick={saveProfile} disabled={saving}>
              {saving ? t('common.processing') : t('common.saveChanges')}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">{t('settings.roles')}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t('settings.roleHint')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {APP_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => (roles.includes(role) ? switchRole(role) : addRole(role))}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  roles.includes(role) ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {roles.includes(role) ? <Check className="h-3.5 w-3.5" /> : null}
                {t(`roles.${role}`)}
              </button>
            ))}
          </div>

          <h2 className="mt-6 font-heading text-base font-semibold">{t('settings.notifications')}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium" />
                  {CHANNELS.map((channel) => (
                    <th key={channel} className="pb-2 text-center font-medium">
                      {t(`settings.notify${channel === 'inapp' ? 'InApp' : channel === 'email' ? 'Email' : 'Telegram'}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NOTIFY_TYPES.map((type) => (
                  <tr key={type} className="border-t border-border">
                    <td className="py-2 pr-2">{t(`settings.channel${type.charAt(0).toUpperCase()}${type.slice(1)}`)}</td>
                    {CHANNELS.map((channel) => (
                      <td key={channel} className="py-2 text-center">
                        <Switch
                          checked={Boolean(notify[`${channel}.${type}`])}
                          onCheckedChange={(checked) => setChannel(`${channel}.${type}`, checked)}
                          aria-label={`${channel}-${type}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-base font-semibold">{t('settings.appearance')}</h2>
            <div className="mt-2 flex gap-1.5">
              {['light', 'dark', 'system'].map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={theme === option ? 'default' : 'outline'}
                  className="flex-1 rounded-lg"
                  onClick={() => setTheme(option)}
                >
                  {t(`settings.theme${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-base font-semibold">{t('settings.verification')}</h2>
              <p className="text-xs text-muted-foreground">
                {user?.verifications?.identity ? t('admin.badgeIdentity') : t('settings.screeningHint')}
              </p>
            </div>
          </div>
          <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">
            <span>{t('settings.screening')}</span>
            <Switch
              checked={Boolean(user?.screening_enabled)}
              onCheckedChange={(checked) => updateAccount({ screening_enabled: checked })}
            />
          </label>
        </section>
      </div>

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal">{t('settings.phoneVerify')}</DialogTitle>
            <DialogDescription>{t('settings.phoneVerifyHint')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sms-code">{t('settings.phoneCode')}</Label>
              <Input id="sms-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" inputMode="numeric" />
            </div>
            {!codeSent ? (
              <Button variant="outline" className="w-full rounded-full" onClick={sendCode}>{t('common.send')}</Button>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setVerifyOpen(false)}>{t('common.cancel')}</Button>
            <Button className="rounded-full" onClick={confirmCode} disabled={code.length < 6}>{t('settings.verify')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}