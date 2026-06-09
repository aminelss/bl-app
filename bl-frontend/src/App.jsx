import React, { useState } from 'react';
import Camera from './pages/Camera';
import OCRForm from './pages/OCRForm';
import EditForm from './pages/EditForm';
import Confirm from './pages/Confirm';
import History from './pages/History';
import Menu from './pages/Menu';
import Success from './pages/Success';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [blData, setBlData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [successData, setSuccessData] = useState(null);

  return (
    <div className="app">
      {screen === 'menu' && (
        <Menu
          onCreateBL={() => setScreen('camera')}
          onHistory={() => setScreen('history')}
        />
      )}

      {screen === 'camera' && (
        <Camera
          onPhoto={(p) => {
            setPhoto(p);
            setScreen('ocr');
          }}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'ocr' && (
        <OCRForm
          photo={photo}
          onData={(d) => {
            setBlData(d);
            setScreen('edit');
          }}
          onBack={() => setScreen('camera')}
        />
      )}

      {screen === 'edit' && (
        <EditForm
          data={blData}
          onData={(d) => {
            setBlData(d);
            setScreen('confirm');
          }}
          onBack={() => setScreen('ocr')}
        />
      )}

      {screen === 'confirm' && (
        <Confirm
          data={blData}
          photo={photo}
          onSuccess={(data) => {
            setSuccessData(data);
            setScreen('success');
          }}
          onBack={() => setScreen('edit')}
        />
      )}

      {screen === 'success' && (
        <Success
          data={successData}
          onNewBL={() => {
            setPhoto(null);
            setBlData(null);
            setScreen('camera');
          }}
          onMenu={() => {
            setPhoto(null);
            setBlData(null);
            setScreen('menu');
          }}
        />
      )}

      {screen === 'history' && (
        <History onBack={() => setScreen('menu')} />
      )}
    </div>
  );
}
