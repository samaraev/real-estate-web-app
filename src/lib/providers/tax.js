/**
 * "Мой налог" self-employed receipt provider — MOCK.
 *
 * SWAP: the real integration requires the self-employed user's INN and an
 * OAuth token issued by lknpd.nalog.ru. Implement it in a backend function
 * (base44/functions/taxReceipt/entry.ts) behind the same method signature.
 */
export const taxProvider = {
  id: 'mock-nalog',
  async createReceipt({ amount, description, inn }) {
    return {
      receiptId: `ln_${Math.random().toString(36).slice(2, 10)}`,
      amount,
      description,
      inn: inn || null,
      status: 'registered',
      link: null,
      registeredAt: new Date().toISOString(),
      mock: true,
    };
  },
};

export default taxProvider;