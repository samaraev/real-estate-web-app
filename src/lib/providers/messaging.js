/**
 * Messaging providers (SMS, email, Telegram) — MOCK implementations.
 *
 * SWAP: real sending happens server-side only. Replace the bodies in
 * base44/functions/notify/entry.ts with an SMS gateway (e.g. SMS.RU),
 * the platform SendEmail integration, and a Telegram bot sendMessage call.
 * Every message is rendered in the recipient's language before sending.
 */
const log = (channel, payload) => {
  // Demo transport: messages are stored in the notification feed instead of being sent.
  console.info(`[mock:${channel}]`, payload);
  return { ok: true, provider: 'mock', channel, at: new Date().toISOString() };
};

export const smsProvider = {
  id: 'mock-sms',
  send({ phone, text }) {
    if (!phone) return { ok: false, reason: 'no_phone' };
    return log('sms', { phone, text });
  },
};

export const emailProvider = {
  id: 'mock-email',
  send({ to, subject, text }) {
    if (!to) return { ok: false, reason: 'no_email' };
    return log('email', { to, subject, text });
  },
};

export const telegramProvider = {
  id: 'mock-telegram',
  send({ username, text }) {
    if (!username) return { ok: false, reason: 'no_telegram' };
    return log('telegram', { username, text });
  },
};

export default { sms: smsProvider, email: emailProvider, telegram: telegramProvider };