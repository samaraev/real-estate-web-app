import { PLAN_QUOTA } from './constants';

export const PLANS = [
  { id: 'free', price: 0 },
  { id: 'owner_pro', price: 990 },
  { id: 'agency', price: 4900 },
];

export const planQuota = (plan) => PLAN_QUOTA[plan] || PLAN_QUOTA.free;

export const periodEnd = (from = new Date()) => {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next.toISOString().slice(0, 10);
};