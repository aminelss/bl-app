import React, { useState, useEffect } from 'react';
import { searchGeocodes } from '../api';

export default function Autocomplete({ value, onChange, onSelect, placeholder, error }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchGeocodes(value);
        if (result.success) {
          setSuggestions(result.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (suggestion) => {
    onChange(suggestion.label);
    if (onSelect) {
      onSelect(suggestion);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
      />

      {loading && <div className="autocomplete-loader">⏳</div>}

      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-suggestions">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="suggestion-item"
              onClick={() => handleSelect(suggestion)}
            >
              📍 {suggestion.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
