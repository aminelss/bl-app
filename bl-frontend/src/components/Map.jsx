import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ blList }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialiser carte
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([43.2965, 5.3698], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(mapInstance.current);
    }

    // Ajouter markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    if (blList.length === 0) return;

    const markerGroup = [];

    blList.forEach((bl) => {
      if (!bl.gps_lat || !bl.gps_lng) return;

      const icon = L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C9.373 0 4 5.373 4 12c0 8 12 28 12 28s12-20 12-28c0-6.627-5.373-12-12-12z" fill="#E30613"/>
            <circle cx="16" cy="12" r="5" fill="white"/>
          </svg>
        `)}`,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker([bl.gps_lat, bl.gps_lng], { icon })
        .bindPopup(`
          <div class="popup">
            <strong>${bl.numero}</strong><br/>
            ${bl.adresse_destination}<br/>
            <small>${new Date(bl.date_creation).toLocaleTimeString('fr-FR')}</small>
          </div>
        `)
        .addTo(mapInstance.current);

      markerGroup.push(marker);
    });

    // Fit bounds
    if (markerGroup.length > 0) {
      const group = new L.featureGroup(markerGroup);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [blList]);

  return <div ref={mapRef} className="map-container"></div>;
}
