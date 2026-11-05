import { base44 } from '@/api/base44Client';
import { CITIES } from '@/lib/constants';

export const findCity = (value) =>
  CITIES.find((item) => item.id === value || item.name.ru === value || item.name.en === value) || null;

export const metroFor = (city, district) => {
  if (!city) return null;
  const index = city.districts.indexOf(district);
  return index >= 0 ? city.metro[index] || null : null;
};

export const districtPath = (cityId, district) =>
  `/neighborhoods/${cityId}/${encodeURIComponent(district)}`;

export const searchPath = (city, district) => {
  const params = new URLSearchParams();
  if (city) params.set('city', city.name.ru);
  if (district) params.set('district', district);
  return `/search?${params.toString()}`;
};

const toMap = (rows = []) =>
  rows.reduce((acc, row) => {
    if (!row.district) return acc;
    acc[row.district] = { count: row.count || 0, avg: row.avg_price || 0 };
    return acc;
  }, {});

/** Average prices and listing counts per district of one city (sale and rent). */
export async function loadCityDistricts(cityName) {
  const [sale, rent] = await Promise.all([
    base44.entities.Listing.aggregate({
      query: { status: 'published', city: cityName, deal_type: 'sale' },
      groupBy: 'district',
      avg: ['price'],
    }),
    base44.entities.Listing.aggregate({
      query: { status: 'published', city: cityName, deal_type: 'rent' },
      groupBy: 'district',
      avg: ['price'],
    }),
  ]);
  return { saleMap: toMap(sale?.rows), rentMap: toMap(rent?.rows) };
}

/** Average price per square metre over a list of sale listings. */
export const pricePerSqm = (items = []) => {
  const pool = items.filter((item) => item.deal_type !== 'rent' && item.area > 0 && item.price > 0);
  if (!pool.length) return 0;
  return Math.round(pool.reduce((sum, item) => sum + item.price / item.area, 0) / pool.length);
};