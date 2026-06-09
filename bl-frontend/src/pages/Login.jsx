import React, { useState } from 'react';
import { deleteAllBL } from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = async () => {
    const newCount = clickCount + 1;
    if (newCount >= 3) {
      setClickCount(0); // On réinitialise le compteur
      try {
        const result = await deleteAllBL();
        if (result.success) {
          alert('🧹 Succès : Toutes les missions et photos ont été supprimées de la base de données !');
        } else {
          alert('❌ Erreur lors de la suppression : ' + (result.error || 'Erreur inconnue'));
        }
      } catch (err) {
        alert('❌ Erreur réseau lors de la suppression.');
      }
    } else {
      setClickCount(newCount);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Vérification des identifiants (insensible à la casse)
    if (username.toLowerCase() === 'testdsi' && password.toLowerCase() === 'testdsi') {
      onLogin();
    } else {
      setError('Identifiants incorrects.');
    }
  };

  return (
    <div className="screen login-screen" style={{ 
      backgroundImage: 'url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px' 
    }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(12px)', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 16px 40px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
        
        <img 
          src="https://bycogepart.fr/wp-content/uploads/2026/02/logo-cogepart-rvb-bleurouge.jpg" 
          alt="Logo Cogepart" 
          onClick={handleLogoClick}
          style={{ height: '50px', objectFit: 'contain', marginBottom: '24px', cursor: 'pointer' }} 
        />
        
        <h1 style={{ margin: '0 0 4px 0', fontSize: '1.6rem', color: '#0E284B', fontWeight: '800' }}>Connexion</h1>
        <p style={{ margin: '0 0 32px 0', color: '#666', fontSize: '1rem', fontWeight: '500' }}>Portail création bordereaux AI</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #ccc', backgroundColor: 'rgba(255,255,255,0.8)', fontSize: '1rem', width: '100%', boxSizing: 'border-box', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #ccc', backgroundColor: 'rgba(255,255,255,0.8)', fontSize: '1rem', width: '100%', boxSizing: 'border-box', outline: 'none' }}
          />

          {error && <div style={{ color: '#E30613', fontSize: '0.9rem', textAlign: 'left', fontWeight: '500' }}>❌ {error}</div>}

          <button 
            type="submit"
            style={{
              background: 'transparent',
              color: '#0E284B',
              border: '2px solid #0E284B',
              borderRadius: '24px',
              padding: '16px',
              fontSize: '1.1rem',
              marginTop: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}