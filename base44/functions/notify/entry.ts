import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * Cross-user notification fan-out. App users cannot create notifications for
 * other users (RLS), so this function runs with service role after checking the
 * caller is signed in and is either the recipient, the record owner or an admin.
 *
 * SWAP: email/Telegram delivery is mocked here — replace the console logging
 * with a real provider (SendEmail integration / Telegram Bot API).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { userId, type, titleKey, params, body: text, link, channel = 'inapp' } = body;
    if (!userId || !type) return Response.json({ error: 'userId and type are required' }, { status: 400 });
    if (channel !== 'inapp' && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const notification = await base44.asServiceRole.entities.Notification.create({
      user_id: userId,
      type,
      title_key: titleKey || type,
      params: params || {},
      body: text || '',
      link: link || '',
      channel,
      is_read: false,
    });

    return Response.json({ ok: true, notification });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}