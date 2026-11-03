/**
 * E-signature provider — MOCK.
 *
 * SWAP: replace with Kontur.Signature / Documino / SberKorus API inside a backend
 * function. The document record keeps `signatures: [{ user_id, name, at, method }]`
 * which is the same shape real providers return.
 */
export const esignProvider = {
  id: 'mock-esign',
  async requestSignature({ documentId, participantIds }) {
    return {
      documentId,
      status: 'sent',
      requests: participantIds.map((id) => ({ user_id: id, status: 'pending' })),
    };
  },
  async sign({ documentId, userId, name }) {
    return {
      documentId,
      user_id: userId,
      name,
      method: 'sms_code_mock',
      at: new Date().toISOString(),
      status: 'signed',
    };
  },
};

export default esignProvider;