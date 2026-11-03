/**
 * Escrow (safe settlements) provider — MOCK.
 *
 * SWAP: real safe-payment partners (bank escrow / nominal account). Replace the
 * bodies here and call them from base44/functions/payments/entry.ts so the
 * status can only change server-side.
 */
const STAGES = ['none', 'opened', 'funded', 'released', 'refunded'];

export const escrowProvider = {
  id: 'mock',
  stages: STAGES,
  async open({ dealId, amount, buyerId, ownerId }) {
    return {
      id: `esc_${Math.random().toString(36).slice(2, 9)}`,
      dealId,
      amount,
      buyerId,
      ownerId,
      status: 'opened',
      openedAt: new Date().toISOString(),
    };
  },
  async fund(escrow) {
    return { ...escrow, status: 'funded', fundedAt: new Date().toISOString() };
  },
  async release(escrow) {
    return { ...escrow, status: 'released', releasedAt: new Date().toISOString() };
  },
  async refund(escrow) {
    return { ...escrow, status: 'refunded', refundedAt: new Date().toISOString() };
  },
};

export default escrowProvider;