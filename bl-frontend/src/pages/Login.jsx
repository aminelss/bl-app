import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Vérification des identifiants (sensible à la casse)
    if (username === 'testDsi' && password === 'testDSI') {
      onLogin();
    } else {
      setError('Identifiants incorrects.');
    }
  };

  return (
    <div className="screen login-screen" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 12px 24px rgba(0,0,0,0.06)', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
        
        <img 
          src="https://bycogepart.fr/wp-content/uploads/2026/02/logo-cogepart-rvb-bleurouge.jpg" 
          alt="Logo Cogepart" 
          style={{ height: '50px', objectFit: 'contain', marginBottom: '24px' }} 
        />
        
        <h1 style={{ margin: '0 0 4px 0', fontSize: '1.6rem', color: '#0E284B', fontWeight: '800' }}>Connexion</h1>
        <p style={{ margin: '0 0 32px 0', color: '#666', fontSize: '1rem', fontWeight: '500' }}>Portail Renault Marignane</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', width: '100%', boxSizing: 'border-box', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '16px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', width: '100%', boxSizing: 'border-box', outline: 'none' }}
          />

          {error && <div style={{ color: '#E30613', fontSize: '0.9rem', textAlign: 'left', fontWeight: '500' }}>❌ {error}</div>}

          <button 
            type="submit"
            className="btn-primary"
            style={{
              borderRadius: '12px',
              padding: '16px',
              fontSize: '1.1rem',
              marginTop: '8px',
            }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}