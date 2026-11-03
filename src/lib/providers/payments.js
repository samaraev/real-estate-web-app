/**
 * Payments provider — MOCK implementation.
 *
 * SWAP: replace `createIntent` / `confirm` / `refund` bodies with a real
 * YooKassa / T-Bank API call. Server-side calls belong in
 * base44/functions/payments/entry.ts (the only place secrets may live).
 * Keep the returned shape: { id, status, method, amount, receiptNumber }.
 */
const randomRef = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export const paymentsProvider = {
  id: 'mock',
  methods: ['card', 'sbp', 'bank_transfer'],

  /** Creates a payment intent. Card numbers are never stored or transmitted. */
  async createIntent({ invoiceId, amount, method = 'card', payerName = '' }) {
    return {
      id: randomRef('pay'),
      invoiceId,
      amount,
      method,
      payerName,
      status: 'pending',
      provider: this.id,
    };
  },

  /** Confirms a payment. The demo gateway always approves unless `simulateFailure` is set. */
  async confirm(intent, { simulateFailure = false } = {}) {
    if (simulateFailure) {
      return { ...intent, status: 'failed' };
    }
    return {
      ...intent,
      status: 'succeeded',
      receiptNumber: String(Math.floor(100000 + Math.random() * 899999)),
      confirmedAt: new Date().toISOString(),
    };
  },

  async refund(payment, amount) {
    return { ...payment, status: 'refunded', refundedAmount: amount };
  },

  /** Deterministic pseudo-QR for the SBP screen (no real payload). */
  sbpQrPayload(invoiceId, amount) {
    return `https://qr.nspk.ru/mock?invoice=${invoiceId}&sum=${amount}`;
  },
};

export default paymentsProvider;