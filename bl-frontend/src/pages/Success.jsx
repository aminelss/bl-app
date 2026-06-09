import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils';

export default function Success({ data, onNewBL, onMenu }) {
  const [countdown, setCountdown] = useState(15);
  const [transmitted, setTransmitted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setTransmitted(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen success-screen">
      <div className="success-container">
        <div className="success-icon">✅</div>

        <h2>Bordereau créé avec succès!</h2>

        <div className="success-details">
          <div className="detail-item">
            <span className="icon">🆔</span>
            <span className="text">{data.numero}</span>
          </div>

          <div className="detail-item">
            <span className="icon">📍</span>
            <span className="text">{data.adresse_destination}</span>
          </div>

          <div className="detail-item">
            <span className="icon">⏰</span>
            <span className="text">{formatTime(data.date_creation)}</span>
          </div>
        </div>

        <div className="transmission-status">
          {!transmitted ? (
            <div className="transmitting">
              <div className="spinner"></div>
              <p>Transmission au chauffeur dans <strong>{countdown}s</strong>...</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(15 - countdown) / 15 * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="transmitted">
              <div className="checkmark">🚗</div>
              <p><strong>Transmis au chauffeur!</strong></p>
              <p className="subtitle">Status: Transmission en cours</p>
            </div>
          )}
        </div>

        <div className="button-group">
          <button onClick={onNewBL} className="btn-primary">
            📸 Créer un nouveau BL
          </button>

          <button onClick={onMenu} className="btn-secondary">
            🏠 Retour au menu
          </button>
        </div>
      </div>
    </div>
  );
}
