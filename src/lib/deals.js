/**
 * Deal pipeline helpers — stage order, checklists and progress.
 * Stage values mirror the `stage` enum on the Deal entity.
 */
export const STAGES = ['inquiry', 'viewing', 'offer', 'deposit', 'documents', 'closing', 'won'];
export const ALL_STAGES = [...STAGES, 'lost'];

export const CHECKLIST_KEYS = ['passport', 'ownership', 'consent', 'contract', 'act', 'receipt'];

export const defaultChecklist = () => CHECKLIST_KEYS.map((key) => ({ key, done: false }));

export const stageIndex = (stage) => {
  const index = STAGES.indexOf(stage);
  if (index !== -1) return index;
  return stage === 'lost' ? STAGES.length - 1 : 0;
};

export const nextStage = (stage) => STAGES[Math.min(stageIndex(stage) + 1, STAGES.length - 1)];

export const progressOf = (deal) => {
  const checklist = Array.isArray(deal?.checklist) ? deal.checklist : [];
  const total = CHECKLIST_KEYS.length;
  const done = checklist.filter((item) => item?.done).length;
  return { done, total: Math.max(total, checklist.length) };
};

export const groupByStage = (deals = []) =>
  ALL_STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter((deal) => (deal.stage || 'inquiry') === stage);
    return acc;
  }, {});

export const dealTitle = (deal) => deal?.property_title || deal?.listing_title || deal?.buyer_name || '—';