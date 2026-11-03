import { base44 } from '@/api/base44Client';
import { geoProvider } from '@/lib/providers/geo';

export const SORT_MAP = {
  relevance: '-created_date',
  priceAsc: 'price',
  priceDesc: '-price',
  dateDesc: '-created_date',
  areaDesc: '-area',
};

export const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=70';

/** Search params → filter object used by both the query builder and saved searches. */
export function paramsToFilters(params) {
  const get = (key) => params.get(key) || undefined;
  return {
    deal: get('deal'),
    category: get('category'),
    city: get('city'),
    district: get('district'),
    metro: get('metro'),
    rooms: get('rooms'),
    priceMin: get('priceMin'),
    priceMax: get('priceMax'),
    areaMin: get('areaMin'),
    areaMax: get('areaMax'),
    pets: params.get('pets') === '1',
    children: params.get('children') === '1',
    utilities: params.get('utilities') === '1',
    keyword: get('keyword'),
    sort: get('sort') || 'relevance',
  };
}

export function filtersToParams(filters) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    if (key === 'sort' && value === 'relevance') return;
    params.set(key, value === true ? '1' : String(value));
  });
  return params;
}

export function buildQuery(f = {}) {
  const query = { status: 'published' };
  if (f.deal) query.deal_type = f.deal;
  if (f.category) query.category = f.category;
  if (f.city) query.city = f.city;
  if (f.district) query.district = f.district;
  if (f.metro) query.metro = f.metro;
  if (f.rooms !== undefined && f.rooms !== '' && f.rooms !== null) query.rooms = Number(f.rooms);
  if (f.priceMin) query.price = { ...(query.price || {}), $gte: Number(f.priceMin) };
  if (f.priceMax) query.price = { ...(query.price || {}), $lte: Number(f.priceMax) };
  if (f.areaMin) query.area = { ...(query.area || {}), $gte: Number(f.areaMin) };
  if (f.areaMax) query.area = { ...(query.area || {}), $lte: Number(f.areaMax) };
  if (f.pets) query.pets_allowed = true;
  if (f.children) query.children_allowed = true;
  if (f.utilities) query.utilities_included = true;
  if (f.keyword) query.title = { $regex: f.keyword, $options: 'i' };
  return query;
}

export async function searchListings({ filters = {}, cursor, limit = 12 }) {
  return base44.entities.Listing.filter(buildQuery(filters), {
    sort: SORT_MAP[filters.sort] || '-created_date',
    limit,
    ...(cursor ? { cursor } : {}),
  });
}

export function roomsLabel(t, rooms) {
  if (rooms === 0) return t('search.studio');
  if (!rooms) return t('common.unknown');
  return t('units.roomCount', { count: rooms });
}

export function priceLabel(money, listing) {
  return money(listing.price, listing.currency || 'RUB');
}

export function addressLine(listing) {
  return [listing.metro, listing.district, listing.city].filter(Boolean).join(' · ');
}

/** Fair-price indicator: compares the listing to the city median for its deal type. */
export function fairPrice(listing, benchmark) {
  if (!benchmark || !listing?.price) return null;
  const diff = ((listing.price - benchmark) / benchmark) * 100;
  if (diff <= -10) return { tone: 'good', percent: Math.abs(Math.round(diff)) };
  if (diff >= 10) return { tone: 'high', percent: Math.round(diff) };
  return { tone: 'fair', percent: 0 };
}

export async function createListing({ user, data, photos, propertyId }) {
  const geo = await geoProvider.geocode({ city: data.city, address: data.address });
  const propertyPayload = {
    title: data.title,
    category: data.category,
    city: data.city,
    district: data.district,
    metro: data.metro,
    address: data.address,
    lat: data.lat || geo.lat,
    lng: data.lng || geo.lng,
    rooms: Number(data.rooms) || 0,
    area: Number(data.area) || 0,
    floor: Number(data.floor) || 0,
    floors: Number(data.floors) || 0,
    year_built: Number(data.year_built) || null,
  };

  let property = null;
  if (propertyId) {
    property = await base44.entities.Property.update(propertyId, propertyPayload);
  } else {
    property = await base44.entities.Property.create(propertyPayload);
  }

  const listingPayload = {
    ...data,
    property_id: property.id,
    lat: propertyPayload.lat,
    lng: propertyPayload.lng,
    price: Number(data.price) || 0,
    area: Number(data.area) || 0,
    rooms: Number(data.rooms) || 0,
    floor: Number(data.floor) || 0,
    floors: Number(data.floors) || 0,
    year_built: Number(data.year_built) || null,
    deposit: Number(data.deposit) || 0,
    owner_user_id: user.id,
    owner_name: user.full_name,
    owner_phone: user.phone || '',
    is_verified_owner: Boolean(user.verifications?.owner),
    cover_url: photos[0]?.file_url || '',
  };
  return { property, listingPayload };
}

export default searchListings;