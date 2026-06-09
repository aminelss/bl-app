import React, { useState, useEffect } from 'react';
import { formatDate, getStatusBadge } from '../utils';

export default function Detail({ bl, onBack }) {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (bl?.id) {
      // On récupère l'URL de base pour construire le lien vers la photo
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
      const photoUrl = `${baseUrl}${bl.photo_path}`;
      setPhoto(photoUrl);
    }
  }, [bl]);

  if (!bl) {
    return (
      <div className="screen detail-screen" style={{ padding: '20px' }}>
        <p>Aucun bordereau sélectionné.</p>
        <button onClick={onBack} className="btn-back">🔙 Retour</button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(bl.statut);

  return (
    <div className="screen detail-screen" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', zIndex: 10, borderBottom: '1px solid #e9ecef' }}>
        <button 
          onClick={onBack}
          style={{ background: '#e9ecef', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', color: '#0E284B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ‹
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0E284B', fontWeight: 'bold' }}>Détail du Bordereau</h2>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Main Info Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0E284B', fontWeight: '800' }}>{bl.numero}</h3>
            <span style={{ backgroundColor: statusBadge.color, color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {statusBadge.label}
            </span>
          </div>
          
          {photo && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <img src={photo} alt={`BL ${bl.numero}`} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
            </div>
          )}

          {/* AI Description */}
          {bl.description_ai && (
            <div style={{ backgroundColor: '#f0f4f8', padding: '16px', borderRadius: '12px', border: '1px solid #e1e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.5rem' }}>✨</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#3B82F6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analyse IA</p>
                <p style={{ margin: '4px 0 0 0', color: '#0E284B', fontStyle: 'italic', fontSize: '1rem', lineHeight: '1.4' }}>"{bl.description_ai}"</p>
              </div>
            </div>
          )}

          {/* Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem', marginTop: '2px' }}>📍</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontWeight: '600' }}>Destination</p>
                <p style={{ margin: '2px 0 0 0', color: '#0E284B', fontWeight: '600', fontSize: '1.05rem' }}>{bl.adresse_destination}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem', marginTop: '2px' }}>📅</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontWeight: '600' }}>Date de création</p>
                <p style={{ margin: '2px 0 0 0', color: '#0E284B' }}>{formatDate(bl.date_creation)}</p>
              </div>
            </div>
            {(bl.poids || bl.dimensions) && (
              <div style={{ display: 'flex', gap: '24px', backgroundColor: '#f8f9fa', padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee' }}>
                {bl.poids && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontWeight: '600' }}>Poids</p>
                    <p style={{ margin: '2px 0 0 0', color: '#0E284B', fontWeight: '600' }}>⚖️ {bl.poids} kg</p>
                  </div>
                )}
                {bl.dimensions && (
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontWeight: '600' }}>Dimensions</p>
                    <p style={{ margin: '2px 0 0 0', color: '#0E284B', fontWeight: '600' }}>📏 {bl.dimensions}</p>
                  </div>
                )}
              </div>
            )}
            {bl.info_complementaire && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem', marginTop: '2px' }}>ℹ️</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', fontWeight: '600' }}>Infos complémentaires</p>
                  <p style={{ margin: '2px 0 0 0', color: '#0E284B' }}>{bl.info_complementaire}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}