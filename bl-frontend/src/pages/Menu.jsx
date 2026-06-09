import React from 'react';

export default function Menu({ onCreateBL, onHistory }) {
  return (
    <div className="screen menu-screen">
      <div className="menu-container">
        <div className="menu-header">
          <h1>📦 Gestion Bordereaux</h1>
          <p>Cogepart - Création rapide de BL</p>
        </div>

        <div className="menu-buttons">
          <button className="btn-primary btn-large" onClick={onCreateBL}>
            <div className="btn-icon">📸</div>
            <div className="btn-text">
              <div className="btn-title">Créer un BL</div>
              <div className="btn-subtitle">Scanner un colis</div>
            </div>
          </button>

          <button className="btn-secondary btn-large" onClick={onHistory}>
            <div className="btn-icon">📋</div>
            <div className="btn-text">
              <div className="btn-title">Historique</div>
              <div className="btn-subtitle">Voir les bordereaux</div>
            </div>
          </button>
        </div>

        <div className="menu-footer">
          <p className="version">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
