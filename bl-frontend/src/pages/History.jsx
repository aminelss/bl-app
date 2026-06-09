import React, { useState, useEffect } from 'react';
import { getBLToday, getAllBL } from '../api';
import { formatDate, formatTime, getStatusBadge } from '../utils';
import Map from '../components/Map';
import Loader from '../components/Loader';

export default function History({ onBack, onSelectBL }) {
  const [tab, setTab] = useState('list'); // 'list' ou 'map'
  const [blList, setBlList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('tous');

  useEffect(() => {
    loadData();
  }, [search, statut, tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si on est sur la carte, on charge tout l'historique. Sinon, juste le jour même.
      const result = tab === 'map' 
        ? await getAllBL('', '', search, statut) 
        : await getBLToday(search, statut);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>📋 Historique</h2>
          <img 
            src="https://bycogepart.fr/wp-content/uploads/2026/02/logo-cogepart-rvb-bleurouge.jpg" 
            alt="Logo Cogepart" 
            style={{ height: '30px', objectFit: 'contain' }} 
          />
        </div>
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
            <div className="bl-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {blList.map((bl) => {
                const statusBadge = getStatusBadge(bl.statut);
                return (
                  <div
                    key={bl.id}
                    className="bl-card"
                    onClick={() => onSelectBL(bl)}
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0E284B', fontWeight: 'bold' }}>{bl.numero}</h3>
                      </div>
                      <span
                        style={{ 
                          backgroundColor: statusBadge.color,
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#4a4a4a', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ marginTop: '2px' }}>📍</span>
                        <span style={{ lineHeight: '1.4' }}>{bl.adresse_destination}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
                          <span>📅</span>
                          <span>{formatDate(bl.date_creation)}</span>
                        </div>
                        {bl.poids && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8f9fa', padding: '4px 8px', borderRadius: '6px' }}>
                            <span>⚖️</span>
                            <span style={{ fontWeight: '500' }}>{bl.poids} kg</span>
                          </div>
                        )}
                      </div>
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
              <p>📭 Aucun point GPS trouvé</p>
            </div>
          ) : (
            <Map blList={blList} onMarkerClick={onSelectBL} />
          )}
        </div>
      )}

      <button onClick={onBack} className="btn-back">
        🔙 Retour
      </button>
    </div>
  );
}
