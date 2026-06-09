import React, { useRef, useState, useEffect } from 'react';
import Loader from '../components/Loader';

export default function Camera({ onPhoto, onBack }) {
    console.log('📸 Camera component mounted!');  // ← Ajoute ça
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1440 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStreaming(true);
            setError(null);
          };
        }
      } catch (err) {
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  const takePhoto = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    canvasRef.current.toBlob(
      (blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          onPhoto(reader.result);
        };
        reader.readAsDataURL(blob);
      },
      'image/webp',
      0.75
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="screen camera-screen">
      <div className="header">
        <h2>📷 Créer un bordereau</h2>
        <p className="subtitle">Prenez une photo du colis</p>
      </div>

      {error && (
        <div className="error-box">
          ⚠️ {error}
        </div>
      )}

      <div className="video-container">
        {streaming ? (
          <video
            ref={videoRef}
            className="video"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="video-placeholder">
            <p>⏳ Initialisation caméra...</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="button-group">
        <button
          onClick={takePhoto}
          disabled={!streaming}
          className="btn-primary"
        >
          📸 Prendre la photo
        </button>

        <button
          onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
          className="btn-secondary"
        >
          🔄 Changer caméra
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary"
        >
          📁 Choisir fichier
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>

      <button onClick={onBack} className="btn-back">
        🔙 Retour
      </button>
    </div>
  );
}
