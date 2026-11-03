/**
 * Verification provider (Gosuslugi identity + Rosreestr property rights) — MOCK.
 *
 * SWAP: replace with the real Gosuslugi ESIA / Rosreestr APIs inside a backend
 * function (base44/functions/verify/entry.ts). Admins then flip the badge on
 * the user record; the UI reads user.verifications only.
 */
export const verificationProvider = {
  id: 'mock',
  async startIdentityCheck({ fullName, phone }) {
    return {
      requestId: `esia_${Math.random().toString(36).slice(2, 9)}`,
      channel: 'gosuslugi',
      status: 'pending',
      subject: fullName || phone,
    };
  },
  async startPropertyCheck({ address, cadastral }) {
    return {
      requestId: `ros_${Math.random().toString(36).slice(2, 9)}`,
      channel: 'rosreestr',
      status: 'pending',
      address,
      cadastral: cadastral || null,
    };
  },
  async poll(requestId) {
    // Demo: checks are approved manually by an admin in the verification centre.
    return { requestId, status: 'pending' };
  },
};

export default verificationProvider;