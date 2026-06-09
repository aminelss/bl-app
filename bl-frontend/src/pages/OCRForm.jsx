import React, { useState, useEffect } from 'react';
import { processVision } from '../api';
import Loader from '../components/Loader';

export default function OCRForm({ photo, onData, onBack }) {
  const [loading, setLoading] = useState(true);
  const [visionData, setVisionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPhoto = async () => {
      try {
        setLoading(true);
        setError(null);

        const base64 = photo.split(',')[1] || photo;
        const result = await processVision(base64);

        if (result.success) {
          setVisionData(result);
        } else {
          setError(result.error || 'Erreur lors de l\'OCR');
        }
      } catch (err) {
        setError(`Erreur: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    processPhoto();
  }, [photo]);

  const handleRetry = () => {
    setVisionData(null);
    setLoading(true);
    const processPhoto = async () => {
      try {
        const base64 = photo.split(',')[1] || photo;
        const result = await processVision(base64);
        if (result.success) {
          setVisionData(result);
        } else {
          setError(result.error || 'Erreur lors de l\'OCR');
        }
      } catch (err) {
        setError(`Erreur: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    processPhoto();
  };

  const handleValidate = () => {
    if (!visionData) return;

    onData({
      numero_bl: visionData.numero_bl || '',
      adresse_destination: visionData.adresse_destination || '',
      poids: visionData.poids || null,
      dimensions: visionData.dimensions || '',
      contenu: visionData.contenu || '',
      info_complementaire: visionData.info_complementaire || '',
      description_ai: visionData.description_ai || '',
      photo_base64: photo
    });
  };

  if (loading) {
    return (
      <div className="screen ocr-screen">
        <Loader message="Analyse de la photo..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen ocr-screen">
        <div className="error-box">
          ❌ {error}
        </div>

        <div className="photo-preview">
          <img src={photo} alt="Photo du colis" />
        </div>

        <div className="button-group">
          <button onClick={handleRetry} className="btn-primary">
            🔄 Réessayer l'OCR
          </button>
          <button onClick={onBack} className="btn-secondary">
            📸 Reprendre la photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen ocr-screen">
      <h2>✅ Proposition détectée</h2>

      <div className="photo-preview">
        <img src={photo} alt="Photo du colis" />
      </div>

      <div className="ocr-results">
        <div className="result-item">
          <label>📦 Numéro bordereau</label>
          <p className="value">{visionData?.numero_bl || 'N/A'}</p>
          <small className="confidence">
            Confiance: {Math.round((visionData?.numero_confiance || 0) * 100)}%
          </small>
        </div>

        <div className="result-item">
          <label>📍 Destination proposée</label>
          <p className="value">{visionData?.adresse_destination || 'Non détectée'}</p>
          <small className="confidence">
            Confiance: {Math.round((visionData?.adresse_confiance || 0) * 100)}%
          </small>
        </div>

        <div className="result-item">
          <label>⚖️ Poids estimé</label>
          <p className="value">
            {visionData?.poids ? `${visionData.poids} ${visionData.poids_unite || 'kg'}` : 'N/A'}
          </p>
          <small className="confidence">
            Confiance: {Math.round((visionData?.poids_confiance || 0) * 100)}%
          </small>
        </div>

        <div className="result-item">
          <label>📏 Dimensions</label>
          <p className="value">{visionData?.dimensions || 'N/A'}</p>
          <small className="confidence">
            Confiance: {Math.round((visionData?.dimensions_confiance || 0) * 100)}%
          </small>
        </div>

        <div className="result-item">
          <label>📦 Contenu</label>
          <p className="value">{visionData?.contenu || 'N/A'}</p>
        </div>

        <div className="result-item">
          <label>✨ Description IA</label>
          <p className="value italic">{visionData?.description_ai || 'Génération...'}</p>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleValidate} className="btn-primary">
          ✅ Valider & Continuer
        </button>

        <button onClick={onBack} className="btn-secondary">
          ✏️ Modifier manuellement
        </button>

        <button onClick={handleRetry} className="btn-secondary">
          🔄 Réanalyser
        </button>
      </div>

      <button onClick={onBack} className="btn-back">
        🔙 Retour
      </button>
    </div>
  );
}
