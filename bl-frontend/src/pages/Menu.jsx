import React from 'react';

export default function Menu({ onCreateBL, onHistory, onLogout }) {
  // Formatage de la date du jour (ex: "mardi 14 juin")
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', day: 'numeric', month: 'long' 
  });

  return (
    <div className="screen menu-screen" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <div className="menu-container" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '10px' }}>
        
        {/* En-tête personnalisé */}
        <div className="menu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0E284B', fontWeight: '800' }}>Bonjour ! 👋</h1>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '1rem', textTransform: 'capitalize' }}>{today}</p>
          </div>
          <img 
            src="https://bycogepart.fr/wp-content/uploads/2026/02/logo-cogepart-rvb-bleurouge.jpg" 
            alt="Logo Cogepart" 
            style={{ height: '55px', objectFit: 'contain', backgroundColor: 'white', padding: '8px 14px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} 
          />
        </div>

        <h2 style={{ fontSize: '1.1rem', color: '#4a4a4a', marginBottom: '16px', fontWeight: '600' }}>Que souhaitez-vous faire ?</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Carte Créer BL (Mise en avant) */}
          <div 
            onClick={onCreateBL}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'transparent',
              color: '#0E284B',
              borderRadius: '24px',
              padding: '28px 24px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'none',
              cursor: 'pointer',
              border: '2px solid #0E284B',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Filigrane en arrière-plan */}
            <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '120px', opacity: 0.04, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
              📦
            </div>
            
            <div style={{ fontSize: '2rem', marginRight: '20px', backgroundColor: 'rgba(14, 40, 75, 0.08)', borderRadius: '18px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📸
            </div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>Nouveau Bordereau</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#666' }}>Scanner et analyser un colis</p>
            </div>
            <div style={{ fontSize: '2rem', color: '#0E284B', paddingLeft: '8px', zIndex: 1 }}>›</div>
          </div>

          {/* Carte Historique (Secondaire) */}
          <div 
            onClick={onHistory}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'transparent',
              color: '#0E284B',
              borderRadius: '24px',
              padding: '28px 24px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'none',
              border: '2px solid #d1d5db',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Filigrane en arrière-plan */}
            <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '120px', opacity: 0.03, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
              📋
            </div>

            <div style={{ fontSize: '2rem', marginRight: '20px', backgroundColor: '#f0f4f8', borderRadius: '18px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0E284B' }}>
              📋
            </div>
            <div style={{ flex: 1, zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>Historique</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#666' }}>Consulter les expéditions</p>
            </div>
            <div style={{ fontSize: '2rem', color: '#ccc', paddingLeft: '8px', zIndex: 1 }}>›</div>
          </div>
        </div>

        {/* Bouton de déconnexion */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button 
            onClick={onLogout}
            style={{ background: 'transparent', color: '#E30613', border: '2px solid #E30613', borderRadius: '24px', padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            🚪 Déconnexion
          </button>
        </div>

        <div className="menu-footer" style={{ textAlign: 'center', marginTop: '40px', color: '#aaa', fontSize: '0.85rem' }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Cogepart</p>
          <p style={{ margin: '4px 0 0 0' }}>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
