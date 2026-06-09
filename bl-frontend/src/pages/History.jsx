import React, { useState, useEffect } from 'react';
import { getBLToday, getAllBL } from '../api';
import { formatDate, formatTime, getStatusBadge } from '../utils';
import Map from '../components/Map';
import Modal from '../components/Modal';
import Loader from '../components/Loader';

export default function History({ onBack }) {
  const [tab, setTab] = useState('list'); // 'list' ou 'map'
  const [blList, setBlList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('tous');
  const [selectedBL, setSelectedBL] = useState(null);

  useEffect(() => {
    loadData();
  }, [search, statut]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getBLToday(search, statut);

      if (result.success) {
        setBlList(result.bl);
      } else {
        setError(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleStatutChange = (e) => {
    setStatut(e.target.value);
  };

  return (
    <div className="screen history-screen">
      <div className="header">
        <h2>📋 Historique</h2>
        <div className="tabs">
          <button
            className={`tab ${tab === 'list' ? 'active' : ''}`}
            onClick={() => setTab('list')}
          >
            📋 Liste
          </button>
          <button
            className={`tab ${tab === 'map' ? 'active' : ''}`}
            onClick={() => setTab('map')}
          >
            🗺️ Carte
          </button>
        </div>
      </div>

      {tab === 'list' && (
        <div className="list-tab">
          <div className="filters">
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <select
              value={statut}
              onChange={handleStatutChange}
              className="status-filter"
            >
              <option value="tous">⭕ Tous</option>
              <option value="créé">📝 Créé</option>
              <option value="transmis au chauffeur">🚗 Transmis</option>
            </select>
          </div>

          {error && (
            <div className="error-box">
              ❌ {error}
            </div>
          )}

          {loading ? (
            <Loader message="Chargement des BL..." />
          ) : blList.length === 0 ? (
            <div className="empty-state">
              <p>📭 Aucun bordereau pour aujourd'hui</p>
            </div>
          ) : (
            <div className="bl-list">
              {blList.map((bl) => {
                const statusBadge = getStatusBadge(bl.statut);
                return (
                  <div
                    key={bl.id}
                    className="bl-card"
                    onClick={() => setSelectedBL(bl)}
                  >
                    <div className="bl-header">
                      <h3>{bl.numero}</h3>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusBadge.color }}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="bl-details">
                      <p>📍 {bl.adresse_destination}</p>
                      <p>⏰ {formatTime(bl.date_creation)}</p>
                      {bl.poids && <p>⚖️ {bl.poids} kg</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'map' && (
        <div className="map-tab">
          {loading ? (
            <Loader message="Chargement de la carte..." />
          ) : blList.length === 0 ? (
            <div className="empty-state">
              <p>📭 Aucun point GPS pour aujourd'hui</p>
            </div>
          ) : (
            <Map blList={blList} />
          )}
        </div>
      )}

      {selectedBL && (
        <Modal
          bl={selectedBL}
          onClose={() => setSelectedBL(null)}
        />
      )}

      <button onClick={onBack} className="btn-back">
        🔙 Retour
      </button>
    </div>
  );
}
