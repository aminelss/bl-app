import React, { useState } from 'react';
import { searchGeocodes } from '../api';
import Autocomplete from '../components/Autocomplete';

export default function EditForm({ data, onData, onBack }) {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.numero_bl || formData.numero_bl.trim() === '') {
      newErrors.numero_bl = 'Numéro de bordereau obligatoire';
    }
    if (!formData.adresse_destination || formData.adresse_destination.trim() === '') {
      newErrors.adresse_destination = 'Adresse de destination obligatoire';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onData(formData);
    }
  };

  return (
    <div className="screen edit-screen">
      <h2>✏️ Modifier les informations</h2>

      <div className="form-section">
        <label htmlFor="numero_bl">
          🆔 Numéro bordereau <span className="required">*</span>
        </label>
        <input
          id="numero_bl"
          type="text"
          value={formData.numero_bl || ''}
          onChange={(e) => handleChange('numero_bl', e.target.value)}
          placeholder="ABC12345"
          maxLength={20}
          className={errors.numero_bl ? 'input-error' : ''}
        />
        {errors.numero_bl && <span className="error-text">{errors.numero_bl}</span>}
      </div>

      <div className="form-section">
        <label>📍 Adresse départ (fixe)</label>
        <input
          type="text"
          value="RENAULT-MARIGNANE"
          disabled
          className="input-disabled"
        />
      </div>

      <div className="form-section">
        <label htmlFor="adresse_destination">
          📍 Adresse destination <span className="required">*</span>
        </label>
        <Autocomplete
          value={formData.adresse_destination || ''}
          onChange={(value) => handleChange('adresse_destination', value)}
          placeholder="123 Rue de Paris, 75000"
          error={errors.adresse_destination}
        />
        {errors.adresse_destination && <span className="error-text">{errors.adresse_destination}</span>}
      </div>

      <div className="form-row">
        <div className="form-section">
          <label htmlFor="poids">⚖️ Poids (kg)</label>
          <input
            id="poids"
            type="number"
            step="0.1"
            min="0"
            value={formData.poids || ''}
            onChange={(e) => handleChange('poids', e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="2.5"
          />
        </div>

        <div className="form-section">
          <label htmlFor="dimensions">📏 Dimensions (LxlxH)</label>
          <input
            id="dimensions"
            type="text"
            value={formData.dimensions || ''}
            onChange={(e) => handleChange('dimensions', e.target.value)}
            placeholder="30x20x15"
          />
        </div>
      </div>

      <div className="form-section">
        <label htmlFor="contenu">📦 Contenu</label>
        <input
          id="contenu"
          type="text"
          value={formData.contenu || ''}
          onChange={(e) => handleChange('contenu', e.target.value)}
          placeholder="Electronique, livres..."
        />
      </div>

      <div className="form-section">
        <label htmlFor="info_complementaire">📋 Info supplémentaires</label>
        <textarea
          id="info_complementaire"
          value={formData.info_complementaire || ''}
          onChange={(e) => handleChange('info_complementaire', e.target.value)}
          placeholder="Code barre, expédient, remarques..."
          rows={2}
        />
      </div>

      <div className="form-section">
        <label htmlFor="description_ai">✨ Description IA</label>
        <textarea
          id="description_ai"
          value={formData.description_ai || ''}
          onChange={(e) => handleChange('description_ai', e.target.value)}
          placeholder="Description générée automatiquement..."
          rows={2}
        />
      </div>

      <div className="button-group">
        <button onClick={handleSubmit} className="btn-primary">
          ✅ Continuer
        </button>

        <button onClick={onBack} className="btn-back">
          🔙 Retour
        </button>
      </div>
    </div>
  );
}
