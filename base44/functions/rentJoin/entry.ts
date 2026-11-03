import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * Links the signed-in user to a lease as its tenant (the owner shares the join link).
 * The lease is read and written with the service role because the invited tenant is not
 * a party yet and therefore cannot read the record under RLS; access is granted only when
 * the account email matches the tenant email stored on the lease.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { leaseId } = await req.json().catch(() => ({}));
    if (!leaseId) return Response.json({ error: 'leaseId is required' }, { status: 400 });

    const lease = await base44.asServiceRole.entities.Lease.get(leaseId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!lease) return Response.json({ error: 'Lease not found' }, { status: 404 });

    if (lease.tenant_user_id && lease.tenant_user_id !== user.id) {
      return Response.json({ error: 'lease_taken' }, { status: 403 });
    }

    const email = String(user.email || '').toLowerCase();
    if (lease.tenant_email && String(lease.tenant_email).toLowerCase() !== email) {
      return Response.json({ error: 'email_mismatch' }, { status: 403 });
    }

    const updated = await base44.asServiceRole.entities.Lease.update(lease.id, {
      tenant_user_id: user.id,
      tenant_name: lease.tenant_name || user.full_name || email,
      signed_by_tenant: true,
      status: ['draft', 'pending_tenant'].includes(lease.status) ? 'active' : lease.status,
    });

    if (lease.owner_user_id) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: lease.owner_user_id,
        type: 'lease_joined',
        title_key: 'lease.title',
        params: {},
        body: updated.property_title || '',
        link: `/rent/leases/${lease.id}`,
        channel: 'inapp',
        is_read: false,
      }).catch(() => null);
    }

    return Response.json({ lease: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}