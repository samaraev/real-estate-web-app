/** Money and period helpers shared by the rent functions. */

export const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

export const currentPeriod = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const today = (date = new Date()) => date.toISOString().slice(0, 10);

export const dueDate = (period, dueDay = 5) => {
  const [year, month] = String(period).split('-').map(Number);
  const day = Math.min(Math.max(Number(dueDay) || 5, 1), 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const invoiceNumber = (period, leaseId) =>
  `${String(period).replace('-', '')}-${String(leaseId || '').slice(-4).toUpperCase()}`;

export const sumItems = (items) =>
  round2((items || []).reduce((acc, item) => acc + Number(item.sum || 0), 0));

export const buildInvoicePayload = (lease, period, utilities = 0) => {
  const rent = round2(lease.rent_amount);
  const items = [{ title: 'rent', qty: 1, price: rent, sum: rent }];
  if (utilities > 0) items.push({ title: 'utilities', qty: 1, price: utilities, sum: utilities });

  return {
    lease_id: lease.id,
    number: invoiceNumber(period, lease.id),
    owner_user_id: lease.owner_user_id || '',
    tenant_user_id: lease.tenant_user_id || '',
    tenant_name: lease.tenant_name || '',
    period,
    issue_date: today(),
    due_date: dueDate(period, lease.due_day),
    items,
    total: sumItems(items),
    paid_amount: 0,
    currency: lease.currency || 'RUB',
    status: 'sent',
    kind: 'rent',
    note: '',
    reminders_sent: [],
  };
};