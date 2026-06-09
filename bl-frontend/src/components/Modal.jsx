import React, { useState, useEffect } from 'react';
import { formatDate, getStatusBadge } from '../utils';

export default function Modal({ bl, onClose }) {
  const [photo, setPhoto] = useState(null);
  const statusBadge = getStatusBadge(bl.statut);

  useEffect(() => {
    if (bl.id) {
      const photoUrl = `http://localhost:3000/api/bl/${bl.id}/photo`;
      setPhoto(photoUrl);
    }
  }, [bl.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{bl.numero}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {photo && (
          <div className="modal-photo">
            <img src={photo} alt={`BL ${bl.numero}`} />
          </div>
        )}

        <div className="modal-body">
          <div className="modal-item">
            <span className="label">🆔 Numéro:</span>
            <span className="value">{bl.numero}</span>
          </div>

          <div className="modal-item">
            <span className="label">📍 Départ:</span>
            <span className="value">{bl.adresse_depart}</span>
          </div>

          <div className="modal-item">
            <span className="label">📍 Destination:</span>
            <span className="value">{bl.adresse_destination}</span>
          </div>

          {bl.poids && (
            <div className="modal-item">
              <span className="label">⚖️ Poids:</span>
              <span className="value">{bl.poids} kg</span>
            </div>
          )}

          {bl.dimensions && (
            <div className="modal-item">
              <span className="label">📏 Dimensions:</span>
              <span className="value">{bl.dimensions}</span>
            </div>
          )}

          {bl.contenu && (
            <div className="modal-item">
              <span className="label">📦 Contenu:</span>
              <span className="value">{bl.contenu}</span>
            </div>
          )}

          {bl.info_complementaire && (
            <div className="modal-item">
              <span className="label">📋 Info:</span>
              <span className="value">{bl.info_complementaire}</span>
            </div>
          )}

          {bl.description_ai && (
            <div className="modal-item">
              <span className="label">✨ Description:</span>
              <span className="value italic">{bl.description_ai}</span>
            </div>
          )}

          <div className="modal-item">
            <span className="label">🌍 GPS:</span>
            <span className="value">{bl.gps_lat?.toFixed(4)}, {bl.gps_lng?.toFixed(4)}</span>
          </div>

          <div className="modal-item">
            <span className="label">⏰ Créé:</span>
            <span className="value">{formatDate(bl.date_creation)}</span>
          </div>

          {bl.date_transmission && (
            <div className="modal-item">
              <span className="label">⏰ Transmis:</span>
              <span className="value">{formatDate(bl.date_transmission)}</span>
            </div>
          )}

          <div className="modal-item">
            <span className="label">🔴 Statut:</span>
            <span
              className="status-badge"
              style={{ backgroundColor: statusBadge.color }}
            >
              {statusBadge.label}
            </span>
          </div>
        </div>

        <button className="btn-primary" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}
