import React, { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Landmark, Smartphone, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/i18n';
import { remainingAmount } from '@/lib/rent';

const METHODS = [
  { id: 'card', labelKey: 'payment.card', icon: CreditCard },
  { id: 'sbp', labelKey: 'payment.sbp', icon: Smartphone },
  { id: 'bank_transfer', labelKey: 'payment.bankTransfer', icon: Landmark },
];

const digits = (value) => String(value || '').replace(/\D/g, '');

export default function PayDialog({ open, onOpenChange, invoice, onPaid }) {
  const { t, money } = useI18n();
  const [method, setMethod] = useState('card');
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [state, setState] = useState('idle');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const invoiceId = invoice?.id;
  const remaining = remainingAmount(invoice);

  useEffect(() => {
    if (!open || !invoiceId) return;
    setMethod('card');
    setAmount(String(remainingAmount(invoice)));
    setCard({ number: '', expiry: '', cvc: '' });
    setState('idle');
    setReceipt(null);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoiceId]);

  const amountValue = Number(amount) || 0;
  const cardReady = method !== 'card'
    || (digits(card.number).length === 16 && digits(card.expiry).length >= 4 && digits(card.cvc).length === 3);
  const canPay = state === 'idle' && amountValue > 0 && amountValue <= remaining + 0.01 && cardReady;

  const submit = async () => {
    if (!canPay) return;
    setState('processing');
    setError('');
    try {
      const response = await base44.functions.invoke('rentPayments', {
        action: 'pay',
        invoiceId,
        method,
        amount: amountValue,
      });
      setReceipt(response.data?.payment || null);
      setState('done');
      onPaid?.(response.data?.invoice);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || '');
      setState('failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t('payment.title')}</DialogTitle>
          <DialogDescription>
            {invoice ? t('invoice.number', { number: invoice.number || '—' }) : ''}
          </DialogDescription>
        </DialogHeader>

        {state === 'done' ? (
          <div className="space-y-4 py-2 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" strokeWidth={1.5} />
            <div>
              <p className="font-heading text-lg font-semibold">{t('payment.success')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('payment.successText')}</p>
            </div>
            {receipt?.receipt_number ? (
              <p className="text-sm">{t('payment.receiptNumber', { number: receipt.receipt_number })}</p>
            ) : null}
            <Button className="w-full rounded-full" onClick={() => onOpenChange(false)}>{t('common.close')}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-xl bg-secondary/70 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              {t('payment.mockBanner')}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-[11px] transition-colors ${
                    method === item.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.6} />
                  {t(item.labelKey)}
                </button>
              ))}
            </div>

            {method === 'card' ? (
              <div className="space-y-3">
                <div>
                  <Label className="mb-1.5 block">{t('payment.cardNumber')}</Label>
                  <Input
                    inputMode="numeric"
                    value={card.number}
                    placeholder="4111 1111 1111 1111"
                    onChange={(event) => {
                      const value = digits(event.target.value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
                      setCard((prev) => ({ ...prev, number: value }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block">{t('payment.expiry')}</Label>
                    <Input
                      inputMode="numeric"
                      placeholder="12/30"
                      value={card.expiry}
                      onChange={(event) => {
                        const value = digits(event.target.value).slice(0, 4);
                        setCard((prev) => ({ ...prev, expiry: value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value }));
                      }}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">{t('payment.cvc')}</Label>
                    <Input
                      inputMode="numeric"
                      placeholder="123"
                      value={card.cvc}
                      onChange={(event) => setCard((prev) => ({ ...prev, cvc: digits(event.target.value).slice(0, 3) }))}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{t('payment.testCard')}</p>
              </div>
            ) : null}

            {method === 'sbp' ? (
              <div className="rounded-xl border border-border p-4 text-center">
                <div className="mx-auto grid h-28 w-28 grid-cols-6 gap-0.5 rounded-lg bg-foreground/90 p-2">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span key={index} className={`aspect-square rounded-[1px] ${(index * 7) % 3 === 0 ? 'bg-background' : 'bg-transparent'}`} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{t('payment.sbpHint')}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{t('payment.sbpHintMock')}</p>
              </div>
            ) : null}

            {method === 'bank_transfer' ? (
              <p className="rounded-xl border border-border p-3 text-xs leading-relaxed text-muted-foreground">
                {t('payment.bankTransfer')} · {invoice?.number || ''}
              </p>
            ) : null}

            <div>
              <Label className="mb-1.5 block">{t('invoice.partialAmount')}</Label>
              <Input type="number" min="1" max={remaining} value={amount} onChange={(event) => setAmount(event.target.value)} />
              <p className="mt-1 text-[11px] text-muted-foreground">{t('invoice.remaining')}: {money(remaining, invoice?.currency)}</p>
            </div>

            {state === 'failed' ? (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t('payment.failed')} {error ? `· ${error}` : ''} {t('payment.failedText')}</span>
              </div>
            ) : null}

            <Button className="w-full rounded-full" disabled={!canPay} onClick={submit}>
              {state === 'processing' ? t('payment.processing') : t('payment.pay', { amount: money(amountValue, invoice?.currency) })}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}