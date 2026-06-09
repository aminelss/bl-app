import React, { useRef, useEffect, useState } from 'react';

export default function Camera({ onPhoto, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

useEffect(() => {
  console.log('🎥 useEffect mounted, facingMode:', facingMode);
  
  const startCamera = async () => {
    try {
      console.log('📹 Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });

      console.log('✅ Stream obtained:', stream);

      if (videoRef.current) {
        console.log('📺 Setting video.srcObject...');
        videoRef.current.srcObject = stream;
        
        // Ajouter le listener AVANT de jouer
        const playVideo = async () => {
          console.log('🎬 Attempting to play...');
          try {
            await videoRef.current.play();
            console.log('▶️ Video playing!');
            setStreaming(true);
            setError(null);
          } catch (playErr) {
            console.error('❌ Play failed:', playErr);
            setError(`Play error: ${playErr.message}`);
          }
        };
        
        videoRef.current.onloadedmetadata = playVideo;
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      setError(`Camera error: ${err.message}`);
    }
  };

  startCamera();

  return () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };
}, [facingMode]);

  const takePhoto = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    canvasRef.current.toBlob(blob => {
      const reader = new FileReader();
      reader.onloadend = () => onPhoto(reader.result);
      reader.readAsDataURL(blob);
    }, 'image/webp');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📷 Créer un bordereau</h2>
      {error && <div style={{ color: 'red' }}>⚠️ {error}</div>}
      <video ref={videoRef} style={{ width: '100%', background: '#000', borderRadius: '8px' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="320" height="240" />
      
      <button onClick={takePhoto} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#E30613', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        📸 Prendre photo
      </button>
      
      <button onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')} style={{ width: '100%', padding: '12px', marginTop: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
        🔄 Changer caméra
      </button>
      
      <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '12px', marginTop: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
        📁 Choisir fichier
      </button>
      
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
      
      <button onClick={onBack} style={{ width: '100%', padding: '12px', marginTop: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
        🔙 Retour
      </button>
    </div>
  );
}