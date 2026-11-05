/**
 * Document templates. A generated document stores a plain `content` object
 * (parties + sections) that the detail page renders and prints, so a record
 * stays readable even if the source deal or lease changes later.
 */
export const DOC_TYPES = ['sale_contract', 'lease_contract', 'handover_act', 'deposit_receipt'];

const money = (value, language) =>
  new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const dmy = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return `${String(parsed.getDate()).padStart(2, '0')}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${parsed.getFullYear()}`;
};

const fill = (template, params) => template.replace(/\{(\w+)\}/g, (m, key) => (params[key] === undefined ? m : String(params[key])));

const COPY = {
  ru: {
    types: {
      sale_contract: 'Договор купли-продажи',
      lease_contract: 'Договор аренды',
      handover_act: 'Акт приёма-передачи',
      deposit_receipt: 'Расписка о залоге',
    },
    roles: { seller: 'Продавец', buyer: 'Покупатель', landlord: 'Арендодатель', tenant: 'Жилец' },
    headings: {
      parties: 'Стороны',
      subject: 'Предмет договора',
      price: 'Цена и порядок расчётов',
      term: 'Срок',
      handover: 'Передача объекта',
      signatures: 'Подписи сторон',
    },
    text: {
      sale_subject: 'Продавец обязуется передать в собственность Покупателя объект «{subject}», а Покупатель обязуется принять его и оплатить.',
      sale_price: 'Стоимость объекта составляет {amount}. Расчёты стороны проводят через счёт эскроу либо иным согласованным способом.',
      handover: 'Объект передаётся по акту приёма-передачи. Право собственности переходит после государственной регистрации перехода права.',
      lease_subject: 'Арендодатель передаёт Жильцу во временное владение и пользование объект «{subject}» по адресу: {address}.',
      lease_price: 'Арендная плата — {rent} в месяц, оплата до {due} числа каждого месяца. Залог — {deposit}.',
      lease_term: 'Срок аренды — с {start} по {end}.',
      lease_handover: 'Объект передаётся по акту приёма-передачи, в котором фиксируются показания счётчиков и состояние имущества.',
      act_subject: 'Стороны подтверждают передачу объекта «{subject}». Показания счётчиков и замечания к состоянию зафиксированы на дату подписания.',
      act_claims: 'Стороны подтверждают отсутствие претензий к состоянию объекта на момент передачи.',
      receipt_subject: 'Получен залог {deposit} по объекту «{subject}» в обеспечение исполнения обязательств по договору.',
      receipt_terms: 'Залог возвращается в течение 10 дней после освобождения объекта при отсутствии задолженности и ущерба.',
      unsigned: 'Документ подготовлен в электронном виде и подписывается сторонами электронной подписью.',
    },
  },
  en: {
    types: {
      sale_contract: 'Sale and purchase agreement',
      lease_contract: 'Tenancy agreement',
      handover_act: 'Handover act',
      deposit_receipt: 'Deposit receipt',
    },
    roles: { seller: 'Seller', buyer: 'Buyer', landlord: 'Landlord', tenant: 'Tenant' },
    headings: {
      parties: 'Parties',
      subject: 'Subject',
      price: 'Price and payment',
      term: 'Term',
      handover: 'Handover',
      signatures: 'Signatures',
    },
    text: {
      sale_subject: 'The Seller undertakes to transfer the property “{subject}” into the ownership of the Buyer, and the Buyer undertakes to accept and pay for it.',
      sale_price: 'The price of the property is {amount}. The parties settle through an escrow account or by another agreed method.',
      handover: 'The property is handed over under a handover act. Title passes upon state registration of the transfer.',
      lease_subject: 'The Landlord lets the property “{subject}” at {address} to the Tenant for temporary possession and use.',
      lease_price: 'The rent is {rent} per month, payable by day {due}. Security deposit — {deposit}.',
      lease_term: 'The lease runs from {start} to {end}.',
      lease_handover: 'The property is handed over under an act recording meter readings and the condition of the premises.',
      act_subject: 'The parties confirm the handover of the property “{subject}”. Meter readings and defects are recorded on the signing date.',
      act_claims: 'The parties confirm there are no claims regarding the condition of the property at handover.',
      receipt_subject: 'A security deposit of {deposit} has been received for the property “{subject}” to secure the obligations under the agreement.',
      receipt_terms: 'The deposit is returned within 10 days after the property is vacated, provided there are no arrears or damage.',
      unsigned: 'This document is prepared electronically and signed by the parties with an e-signature.',
    },
  },
};

export const docTypeLabelKey = (type) => `docs.types.${type}`;

export function buildDocument({ type, language = 'ru', deal, lease, user }) {
  const copy = COPY[language] || COPY.ru;
  const isLease = type === 'lease_contract' || (!deal && lease);
  const source = isLease ? lease || {} : deal || {};
  const subject = source.property_title || source.listing_title || (language === 'en' ? 'not specified' : 'не указан');
  const address = isLease ? source.address || source.city || '—' : subject;
  const amount = isLease ? source.rent_amount : source.amount;
  const meName = user?.full_name || user?.email || '—';

  const interpolate = (template, extra = {}) =>
    fill(template, {
      subject,
      address,
      amount: money(amount, language),
      rent: money(source.rent_amount, language),
      deposit: money(isLease ? source.deposit : source.amount, language),
      due: source.due_day || 5,
      start: dmy(source.start_date),
      end: dmy(source.end_date),
      ...extra,
    });

  const parties = isLease
    ? [
        { role: copy.roles.landlord, value: meName },
        { role: copy.roles.tenant, value: source.tenant_name || '—' },
      ]
    : [
        { role: copy.roles.seller, value: meName },
        { role: copy.roles.buyer, value: source.buyer_name || '—' },
      ];

  const sections = [];
  if (type === 'sale_contract') {
    sections.push({ heading: copy.headings.subject, paragraphs: [interpolate(copy.text.sale_subject)] });
    sections.push({ heading: copy.headings.price, paragraphs: [interpolate(copy.text.sale_price)] });
    sections.push({ heading: copy.headings.handover, paragraphs: [copy.text.handover] });
  } else if (type === 'lease_contract') {
    sections.push({ heading: copy.headings.subject, paragraphs: [interpolate(copy.text.lease_subject)] });
    sections.push({ heading: copy.headings.price, paragraphs: [interpolate(copy.text.lease_price)] });
    sections.push({ heading: copy.headings.term, paragraphs: [interpolate(copy.text.lease_term)] });
    sections.push({ heading: copy.headings.handover, paragraphs: [copy.text.lease_handover] });
  } else if (type === 'deposit_receipt') {
    sections.push({ heading: copy.headings.price, paragraphs: [interpolate(copy.text.receipt_subject)] });
    sections.push({ heading: copy.headings.term, paragraphs: [copy.text.receipt_terms] });
  } else {
    sections.push({ heading: copy.headings.subject, paragraphs: [interpolate(copy.text.act_subject)] });
    sections.push({ heading: copy.headings.handover, paragraphs: [copy.text.act_claims] });
  }

  return {
    title: copy.types[type] || copy.types.sale_contract,
    content: {
      title: copy.types[type] || copy.types.sale_contract,
      language,
      subject,
      partiesHeading: copy.headings.parties,
      parties,
      sections,
      note: copy.text.unsigned,
      preparedAt: new Date().toISOString(),
    },
  };
}

export const statusAfterSignature = (signatures, participants) => {
  const signed = (signatures || []).length;
  const expected = Math.max(2, (participants || []).length);
  return signed >= expected ? 'signed' : 'partially_signed';
};