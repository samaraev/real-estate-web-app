// Static reference data for the Russian market demo. City / district / metro names
// are proper nouns and therefore not translated.
export const CITIES = [
  {
    id: 'moscow',
    name: { ru: 'Москва', en: 'Moscow' },
    lat: 55.7558,
    lng: 37.6173,
    zoom: 10,
    districts: ['Хамовники', 'Арбат', 'Пресня', 'Басманный', 'Замоскворечье', 'Аэропорт', 'Тверской'],
    metro: ['Парк Культуры', 'Смоленская', 'Краснопресненская', 'Бауманская', 'Павелецкая', 'Аэропорт', 'Тверская'],
  },
  {
    id: 'spb',
    name: { ru: 'Санкт-Петербург', en: 'Saint Petersburg' },
    lat: 59.9343,
    lng: 30.3351,
    zoom: 10,
    districts: ['Центральный', 'Петроградский', 'Адмиралтейский', 'Василеостровский', 'Московский'],
    metro: ['Невский проспект', 'Петроградская', 'Садовая', 'Василеостровская', 'Московские ворота'],
  },
  {
    id: 'kazan',
    name: { ru: 'Казань', en: 'Kazan' },
    lat: 55.7963,
    lng: 49.1088,
    zoom: 11,
    districts: ['Вахитовский', 'Ново-Савиновский', 'Приволжский', 'Советский'],
    metro: ['Кремлёвская', 'Площадь Тукая', 'Козья слобода', 'Аметьево'],
  },
  {
    id: 'novosibirsk',
    name: { ru: 'Новосибирск', en: 'Novosibirsk' },
    lat: 55.0084,
    lng: 82.9357,
    zoom: 11,
    districts: ['Центральный', 'Заельцовский', 'Октябрьский', 'Ленинский'],
    metro: ['Площадь Ленина', 'Красный проспект', 'Гагаринская', 'Заельцовская'],
  },
];

export const CATEGORIES = ['apartment', 'house', 'room', 'commercial', 'land'];

export const DEAL_TYPES = ['sale', 'rent'];

export const AMENITIES = [
  'balcony', 'parking', 'elevator', 'furniture', 'appliances', 'airConditioning',
  'internet', 'dishwasher', 'washingMachine', 'concierge', 'gym', 'playground',
  'renovation', 'newBuilding', 'yard', 'security',
];

export const LEASE_STATUSES = ['draft', 'pending_tenant', 'active', 'expiring', 'ended', 'terminated'];
export const INVOICE_STATUSES = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded'];
export const METER_KINDS = ['electricity', 'water_cold', 'water_hot', 'gas', 'heating'];
export const DEAL_STAGES = ['inquiry', 'viewing', 'offer', 'deposit', 'documents', 'closing', 'won', 'lost'];
export const APP_ROLES = ['buyer', 'renter', 'owner', 'tenant', 'agent'];

export const cityName = (city, locale = 'ru') => {
  const found = CITIES.find((c) => c.id === city || c.name.ru === city || c.name.en === city);
  return found ? found.name[locale] || found.name.ru : city;
};

export const DEFAULT_SETTINGS = {
  fee_percent: 1.5,
  boost_price: 490,
  currency: 'RUB',
};

export const PLAN_QUOTA = { free: 1, owner_pro: 10, agency: 100 };