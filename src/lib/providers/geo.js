import { CITIES } from '@/lib/constants';

/**
 * Maps / geocoding provider — MOCK (no external calls, no API key).
 *
 * SWAP: replace `geocode` / `suggest` with Yandex Geocoder or 2GIS API calls.
 * Base44 has no maps connector for Russian providers, so the real integration
 * belongs in a backend function with a secret (YANDEX_GEOCODER_KEY).
 */

const normalize = (value = '') => value.toLowerCase().replace(/ё/g, 'е').trim();

export const geoProvider = {
  id: 'mock',

  /** Address → coordinates. Falls back to the city centre with a small offset. */
  async geocode({ city, address }) {
    const matched = CITIES.find((c) => normalize(c.name.ru) === normalize(city) || c.id === city);
    const base = matched || CITIES[0];
    const seed = Array.from(normalize(address || city || 'a')).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return {
      lat: Number((base.lat + ((seed % 120) - 60) / 1200).toFixed(6)),
      lng: Number((base.lng + ((seed % 90) - 45) / 1000).toFixed(6)),
      city: base.name.ru,
    };
  },

  async suggest(query) {
    const q = normalize(query);
    if (!q) return [];
    const out = [];
    CITIES.forEach((city) => {
      if (normalize(city.name.ru).includes(q)) out.push({ type: 'city', label: city.name.ru });
      city.metro.forEach((station) => {
        if (normalize(station).includes(q)) out.push({ type: 'metro', label: station, city: city.name.ru });
      });
      city.districts.forEach((district) => {
        if (normalize(district).includes(q)) out.push({ type: 'district', label: district, city: city.name.ru });
      });
    });
    return out.slice(0, 8);
  },

  cityCenter(city) {
    const matched = CITIES.find((c) => c.id === city || c.name.ru === city);
    return matched ? { lat: matched.lat, lng: matched.lng, zoom: matched.zoom } : { lat: CITIES[0].lat, lng: CITIES[0].lng, zoom: 10 };
  },
};

export default geoProvider;