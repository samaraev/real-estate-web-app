// Shared rent-management helpers: status tones, invoice math, month periods, CSV export.

export const leaseTone = {
  draft: 'neutral',
  pending_tenant: 'amber',
  active: 'green',
  expiring: 'amber',
  ended: 'neutral',
  terminated: 'red',
};

export const invoiceTone = {
  draft: 'neutral',
  sent: 'amber',
  partially_paid: 'blue',
  paid: 'green',
  overdue: 'red',
  cancelled: 'neutral',
  refunded: 'purple',
};

export const paymentTone = {
  pending: 'amber',
  succeeded: 'green',
  failed: 'red',
  refunded: 'purple',
  partial: 'blue',
};

export const readingTone = { submitted: 'amber', approved: 'green', rejected: 'red' };

export const requestTone = {
  new: 'amber',
  in_progress: 'blue',
  waiting: 'purple',
  done: 'green',
  cancelled: 'neutral',
};

export const priorityTone = { low: 'neutral', normal: 'blue', urgent: 'red' };

export const METHOD_KEYS = {
  card: 'payment.card',
  sbp: 'payment.sbp',
  bank_transfer: 'payment.bankTransfer',
};

export const paidAmount = (invoice) => Number(invoice?.paid_amount || 0);

export const remainingAmount = (invoice) =>
  Math.max(0, Number(invoice?.total || 0) - paidAmount(invoice));

export const isOverdue = (invoice) => {
  if (!invoice?.due_date) return false;
  if (!['sent', 'partially_paid'].includes(invoice.status)) return false;
  const due = new Date(`${String(invoice.due_date).slice(0, 10)}T23:59:59`);
  return due.getTime() < Date.now();
};

export const displayInvoiceStatus = (invoice) => (isOverdue(invoice) ? 'overdue' : invoice?.status);

export const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const periodToDate = (period) => new Date(`${period}-01T00:00:00`);

export const monthKey = (value) => (value ? String(value).slice(0, 7) : '');

export const lastMonths = (count = 6) => {
  const months = [];
  const now = new Date();
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

export const downloadCsv = (filename, rows) => {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};