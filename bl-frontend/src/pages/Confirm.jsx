import React, { useState, useEffect } from 'react';
import { createBL } from '../api';
import Loader from '../components/Loader';

export default function Confirm({ data, photo, onSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);

  useEffect(() => {
    const getGPS = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          adresse: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        });
      } catch (err) {
        console.log('GPS error:', err.message);
        setGpsCoords({
          lat: 43.2965,
          lng: 5.3698,
          adresse: 'Marignane (défaut)'
        });
      }
    };

    getGPS();
  }, []);

  const handleCreate = async () => {
    if (!gpsCoords) {
      setError('GPS non disponible');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blData = {
        ...data,
        gps_lat: gpsCoords.lat,
        gps_lng: gpsCoords.lng,
        gps_adresse: gpsCoords.adresse
      };

      const result = await createBL(blData);

      if (result.success) {
        onSuccess(result.bl);
      } else {
        setError(result.error || 'Erreur lors de la création du BL');
      }
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="screen confirm-screen">
        <Loader message="Création du BL..." />
      </div>
    );
  }

  return (
    <div className="screen confirm-screen">
      <h2>📋 Résumé du bordereau</h2>

      {error && (
        <div className="error-box">
          ❌ {error}
          <button onClick={handleCreate} className="btn-sm btn-retry">
            🔄 Réessayer
          </button>
        </div>
      )}

      <div className="photo-preview-confirm">
        <img src={photo} alt="Photo du colis" />
      </div>

      <div className="summary">
        <div className="summary-item">
          <span className="label">🆔 Numéro:</span>
          <span className="value">{data.numero_bl}</span>
        </div>

        <div className="summary-item">
          <span className="label">📍 Départ:</span>
          <span className="value">RENAULT-MARIGNANE</span>
        </div>

        <div className="summary-item">
          <span className="label">📍 Destination:</span>
          <span className="value">{data.adresse_destination}</span>
        </div>

        {data.poids && (
          <div className="summary-item">
            <span className="label">⚖️ Poids:</span>
            <span className="value">{data.poids} kg</span>
          </div>
        )}

        {data.dimensions && (
          <div className="summary-item">
            <span className="label">📏 Dimensions:</span>
            <span className="value">{data.dimensions}</span>
          </div>
        )}

        {data.contenu && (
          <div className="summary-item">
            <span className="label">📦 Contenu:</span>
            <span className="value">{data.contenu}</span>
          </div>
        )}

        <div className="summary-item">
          <span className="label">🌍 GPS:</span>
          <span className="value">
            {gpsCoords ? `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}` : 'Localisation...'}
          </span>
        </div>

        <div className="summary-item">
          <span className="label">✨ Description:</span>
          <span className="value italic">{data.description_ai}</span>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleCreate} className="btn-primary" disabled={loading || !gpsCoords}>
          ✅ Créer le bordereau
        </button>

        <button onClick={onBack} className="btn-secondary">
          ✏️ Modifier
        </button>
      </div>

      <button onClick={onBack} className="btn-back">
        🔙 Retour
      </button>
    </div>
  );
}
