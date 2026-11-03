import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * Increments the listing view counter with service role, because visitors are
 * not allowed to update listings they do not own. Skips the owner's own views.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { listingId } = await req.json().catch(() => ({}));
    if (!listingId) return Response.json({ error: 'listingId is required' }, { status: 400 });

    const listing = await base44.asServiceRole.entities.Listing.get(listingId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!listing) return Response.json({ error: 'Not found' }, { status: 404 });

    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (user && user.id === listing.owner_user_id) return Response.json({ ok: true, skipped: true });

    const views = Number(listing.views_count || 0) + 1;
    await base44.asServiceRole.entities.Listing.update(listingId, { views_count: views });
    return Response.json({ ok: true, views });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}