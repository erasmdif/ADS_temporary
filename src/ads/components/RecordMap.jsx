import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { pointGeometry } from '../services/database.js';
import { localUrl } from '../services/paths.jsx';

export default function RecordMap({ places }) {
  const container = useRef(null);
  useEffect(() => {
    const points = places.flatMap(place => { const geometry = pointGeometry(place.coordinates); return geometry ? [{ place, position: [geometry.coordinates[1], geometry.coordinates[0]] }] : []; });
    if (!points.length || !container.current) return;
    const map = L.map(container.current, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    for (const { place, position } of points) {
      const link = document.createElement('a'); link.textContent = place.nome_luogo || `Luogo ${place.id}`;
      link.href = localUrl(`/luogo/?tb=luogo&id=${encodeURIComponent(place.id)}`);
      L.circleMarker(position, { radius: 8, color: '#fff3dd', weight: 2, fillColor: '#8c1927', fillOpacity: 1 }).bindTooltip(place.nome_luogo || `Luogo ${place.id}`).bindPopup(link).addTo(map);
    }
    const fit = () => { map.invalidateSize(); if (points.length === 1) map.setView(points[0].position, 12); else map.fitBounds(points.map(p => p.position), { padding: [35,35], maxZoom: 13 }); };
    const observer = new ResizeObserver(fit); observer.observe(container.current); fit();
    return () => { observer.disconnect(); map.remove(); };
  }, [places]);
  return <div className="rec-map" ref={container} role="region" aria-label="Mappa interattiva dei luoghi collegati" />;
}
