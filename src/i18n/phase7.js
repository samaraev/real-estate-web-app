/**
 * Phase 7 translations (neighborhood pages, partners directory, accessibility).
 * Merged into ru.json / en.json at load time.
 */
const ru = {
  a11y: {
    skipToContent: 'Перейти к содержанию',
    breadcrumb: 'Хлебные крошки',
  },
  neighborhood: {
    saleCount: 'На продажу',
    rentCount: 'В аренду',
    avgSqm: 'Средняя цена м²',
    summary: 'Район {district} в городе {city}: объявления о продаже и аренде, средние цены и соседние районы.',
    allListings: 'Все объявления района',
    otherDistricts: 'Другие районы',
    noListings: 'В этом районе пока нет объявлений',
    noListingsHint: 'Посмотрите соседние районы или сохраните поиск — сообщим о новых объявлениях.',
    backToDistricts: 'Все районы',
    browseAll: 'Все районы и метро',
  },
  partners: {
    search: 'Поиск по названию',
    allTypes: 'Все',
    verified: 'Проверенный партнёр',
    emptyHint: 'Список партнёров появится здесь, когда его заполнит администратор.',
    contacts: 'Контакты',
    requestHint: 'Опишите задачу — партнёр свяжется с вами.',
    needMessage: 'Опишите, что нужно сделать',
  },
};

const en = {
  a11y: {
    skipToContent: 'Skip to content',
    breadcrumb: 'Breadcrumb',
  },
  neighborhood: {
    saleCount: 'For sale',
    rentCount: 'For rent',
    avgSqm: 'Average price per m²',
    summary: 'The {district} area of {city}: listings for sale and rent, average prices and nearby areas.',
    allListings: 'All listings in the area',
    otherDistricts: 'Other areas',
    noListings: 'No listings in this area yet',
    noListingsHint: 'Browse nearby areas or save your search to hear about new listings.',
    backToDistricts: 'All areas',
    browseAll: 'All areas and metro',
  },
  partners: {
    search: 'Search by name',
    allTypes: 'All',
    verified: 'Verified partner',
    emptyHint: 'Partners will appear here once an administrator adds them.',
    contacts: 'Contacts',
    requestHint: 'Describe the task and the partner will get in touch.',
    needMessage: 'Describe what you need',
  },
};

export default { ru, en };