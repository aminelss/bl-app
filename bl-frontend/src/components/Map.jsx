import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ blList, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialiser carte
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([43.2965, 5.3698], 10);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Force la carte à recalculer sa taille une fois le conteneur affiché
      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.invalidateSize();
      }, 250);
    }

    // Ajouter markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.current.removeLayer(layer);
      }
    });

    if (blList.length === 0) return;

    const markerGroup = [];

    // Coordonnées par défaut du point de départ (RENAULT-MARIGNANE)
    const DEPARTURE_GPS = [43.436, 5.215];

    // Marqueur de départ (Bleu marin)
    const departIcon = L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C9.373 0 4 5.373 4 12c0 8 12 28 12 28s12-20 12-28c0-6.627-5.373-12-12-12z" fill="#0E284B"/>
          <circle cx="16" cy="12" r="5" fill="white"/>
        </svg>
      `)}`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40]
    });

    const departMarker = L.marker(DEPARTURE_GPS, { icon: departIcon })
      .bindPopup('<div class="popup"><strong>📍 Point de départ</strong><br/>RENAULT-MARIGNANE</div>')
      .addTo(mapInstance.current);
    
    markerGroup.push(departMarker);

    // Dictionnaire pour mémoriser les coordonnées déjà placées sur la carte
    const seenCoords = {};

    blList.forEach((bl) => {
      if (!bl.gps_lat || !bl.gps_lng) return;

      let lat = bl.gps_lat;
      let lng = bl.gps_lng;
      
      // Clé unique pour la coordonnée (arrondie à ~11 mètres près)
      const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (seenCoords[coordKey]) {
        // Décalage léger vers le Nord-Est pour éviter la superposition parfaite
        lat += seenCoords[coordKey] * 0.0003;
        lng += seenCoords[coordKey] * 0.0003;
        seenCoords[coordKey]++;
      } else {
        seenCoords[coordKey] = 1;
      }

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

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`
          <div class="popup">
            <strong>${bl.numero}</strong><br/>
            ${bl.adresse_destination}<br/>
            <small>${new Date(bl.date_creation).toLocaleTimeString('fr-FR')}</small>
          </div>
        `)
        .addTo(mapInstance.current);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(bl));
      }

      markerGroup.push(marker);

      // Tracer le chemin (ligne en pointillés) entre le départ et l'arrivée
      const routeLine = L.polyline([DEPARTURE_GPS, [lat, lng]], {
        color: '#0E284B', // Bleu marin (Couleur Cogepart)
        weight: 3,
        dashArray: '5, 8', // Crée un effet de pointillés
        opacity: 0.6
      }).addTo(mapInstance.current);
      
      markerGroup.push(routeLine);
    });

    // Fit bounds
    if (markerGroup.length > 0) {
      const group = new L.featureGroup(markerGroup);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [blList]);

  // Nettoyage de la carte à la destruction du composant
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className="map-container" style={{ minHeight: '400px', width: '100%', zIndex: 0 }}></div>;
}
