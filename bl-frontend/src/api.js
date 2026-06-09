import axios from 'axios';

// Détecte automatiquement l'URL API
const getAPIURL = () => {
  // Si on est en développement
  if (import.meta.env.DEV) {
    // Si accès par IP (pas localhost), détermine l'IP du backend
    const currentHost = window.location.hostname;
    
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      // Localhost = backend aussi sur localhost
      return 'http://localhost:3000/api';
    } else {
      // IP réseau = backend sur même IP
      return `http://${currentHost}:3000/api`;
    }
  }
  
  // Production
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

const API_URL = getAPIURL();
console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

export async function processVision(photoBase64) {
  try {
    const res = await api.post('/vision/process-colis', {
      photo_base64: photoBase64
    });
    return res.data;
  } catch (error) {
    console.error('Vision error:', error.message);
    throw error;
  }
}

export async function createBL(data) {
  let attempts = 0;
  const maxRetries = 3;
  const retryDelay = 2000;

  while (attempts < maxRetries) {
    try {
      const res = await api.post('/bl/create', data);
      return res.data;
    } catch (error) {
      attempts++;
      console.log(`Retry ${attempts}/${maxRetries}...`);
      
      if (attempts >= maxRetries) {
        return {
          success: false,
          error: `Erreur après ${maxRetries} tentatives: ${error.message}`
        };
      }
      
      await new Promise(r => setTimeout(r, retryDelay));
    }
  }
}

export async function getBLToday(search = '', statut = 'tous') {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statut && statut !== 'tous') params.append('statut', statut);
    
    const res = await api.get(`/bl/today?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.error('Get today error:', error.message);
    throw error;
  }
}

export async function getAllBL(dateFrom = '', dateTo = '', search = '', statut = 'tous') {
  try {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (search) params.append('search', search);
    if (statut && statut !== 'tous') params.append('statut', statut);
    
    const res = await api.get(`/bl?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.error('Get all error:', error.message);
    throw error;
  }
}

export async function getBL(id) {
  try {
    const res = await api.get(`/bl/${id}`);
    return res.data;
  } catch (error) {
    console.error('Get BL error:', error.message);
    throw error;
  }
}

export async function searchGeocodes(q) {
  if (!q || q.length < 2) return { suggestions: [] };
  
  try {
    const res = await api.get(`/geocode/search`, {
      params: { q, limit: 5 }
    });
    return res.data;
  } catch (error) {
    console.error('Geocode error:', error.message);
    return { success: false, suggestions: [] };
  }
}

export async function deleteAllBL() {
  try {
    const res = await api.delete('/bl/all');
    return res.data;
  } catch (error) {
    console.error('Delete all error:', error.message);
    return { success: false, error: error.message };
  }
}

export default api;
