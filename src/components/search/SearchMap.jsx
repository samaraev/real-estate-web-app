import React, { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geoProvider } from '@/lib/providers/geo';
import { useI18n } from '@/i18n';

/**
 * Price-pin map. Pins that fall into the same coarse grid cell are collapsed
 * into one cluster pin — a lightweight client-side clustering, no extra deps.
 */
export default function SearchMap({ listings, city, onOpen }) {
  const { money } = useI18n();
  const center = useMemo(() => geoProvider.cityCenter(city), [city]);

  const clusters = useMemo(() => {
    const groups = new Map();
    listings.forEach((listing) => {
      if (!listing.lat || !listing.lng) return;
      const key = `${listing.lat.toFixed(1)}:${listing.lng.toFixed(1)}`;
      const group = groups.get(key) || [];
      group.push(listing);
      groups.set(key, group);
    });
    return Array.from(groups.values());
  }, [listings]);

  const iconFor = (group) => {
    const first = group[0];
    const label = group.length > 1 ? `${group.length}` : money(first.price, first.currency || 'RUB');
    return L.divIcon({
      className: '',
      html: `<div style="transform:translate(-50%,-100%);white-space:nowrap;background:#122b25;color:#f7f4ee;border-radius:999px;padding:5px 10px;font:600 12px 'Manrope',sans-serif;box-shadow:0 6px 18px -8px rgba(0,0,0,.6)">${label}</div>`,
      iconSize: [0, 0],
    });
  };

  return (
    <div className="h-[65vh] min-h-[380px] overflow-hidden rounded-2xl border border-border">
      <MapContainer center={[center.lat, center.lng]} zoom={center.zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {clusters.map((group) => {
          const first = group[0];
          return (
            <Marker
              key={`${first.lat}-${first.lng}-${group.length}`}
              position={[first.lat, first.lng]}
              icon={iconFor(group)}
              eventHandlers={{ click: () => onOpen(group.length > 1 ? `/search?deal=${first.deal_type}&city=${encodeURIComponent(first.city || '')}` : `/listing/${first.id}`) }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], center.zoom);
  }, [center, map]);
  return null;
}