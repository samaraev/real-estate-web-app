/**
 * Deal pipeline helpers — stage order, checklists and progress.
 * Stage values mirror the `stage` enum on the Deal entity.
 */
export const STAGES = ['inquiry', 'viewing', 'offer', 'deposit', 'documents', 'closing', 'won'];
export const ALL_STAGES = [...STAGES, 'lost'];

export const CHECKLIST_KEYS = ['passport', 'ownership', 'consent', 'contract', 'act', 'receipt'];

export const defaultChecklist = () => CHECKLIST_KEYS.map((key) => ({ key, done: false }));

/**
 * Checklist items always come back with a known step key, even when older
 * records were saved without one (bare strings, `label`-only objects, etc.).
 */
export const normalizeChecklist = (checklist) => {
  const list = Array.isArray(checklist) && checklist.length ? checklist : defaultChecklist();
  return list.map((item, index) => {
    const value = item && typeof item === 'object' ? item : {};
    const isKnownString = typeof item === 'string' && CHECKLIST_KEYS.includes(item);
    const key = isKnownString
      ? item
      : CHECKLIST_KEYS.includes(value?.key)
        ? value.key
        : CHECKLIST_KEYS[index] || `step_${index}`;
    const fallbackLabel = typeof item === 'string' && !isKnownString ? item : value.label || value.title || '';
    return { key, done: Boolean(value?.done), label: fallbackLabel };
  });
};

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