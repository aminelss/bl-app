# BL Frontend - Gestion Bordereaux Cogepart

App React web responsive pour création et gestion de bordereaux avec caméra, OCR et carte interactive.

## 📋 Démarrage rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration

Fichier `.env` est pré-rempli, vérifier :

```
VITE_API_URL=http://localhost:3000/api
```

### 3. Lancer le frontend

```bash
npm run dev
```

✅ App disponible sur **http://localhost:5173**

---

## 🎨 Écrans

1. **Menu** : Créer BL / Historique
2. **Camera** : Prendre photo (avant/arrière)
3. **OCRForm** : Résultats OCR Gemini (confirmer/modifier)
4. **EditForm** : Saisie manuelle des données
5. **Confirm** : Résumé avant création
6. **Success** : Confirmation + transmission auto 10-15s
7. **History** : Liste + Carte des BL du jour

---

## 🔧 Pages & Composants

### Pages (`src/pages/`)

```
Menu.jsx       - 🏠 Menu principal
Camera.jsx     - 📷 Caméra + capture
OCRForm.jsx    - ✅ Résultats OCR
EditForm.jsx   - ✏️ Saisie manuelle
Confirm.jsx    - 📋 Résumé + GPS
Success.jsx    - ✨ Confirmation
History.jsx    - 📋 Historique + Carte
```

### Composants (`src/components/`)

```
Loader.jsx        - ⏳ Spinner + message
Modal.jsx         - 🔍 Détail BL
Map.jsx           - 🗺️ Leaflet + OpenStreetMap
Autocomplete.jsx  - 📍 Google Places
```

---

## 🎯 Workflow utilisateur

```
Menu
 ├─ 📸 Créer BL
 │   └─ Camera → OCRForm → EditForm → Confirm → Success
 └─ 📋 Historique
     ├─ Liste (filtres + recherche)
     └─ Carte (tous les points GPS)
```

---

## 🛠️ Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Nettoyer
rm -rf node_modules
npm install
```

---

## 📊 Dépendances

| Paquet | Version | Usage |
|--------|---------|-------|
| **react** | ^18.2 | Framework |
| **react-dom** | ^18.2 | DOM |
| **axios** | ^1.6 | API calls |
| **leaflet** | ^1.9 | Carte interactive |
| **react-leaflet** | ^4.2 | Wrapper React Leaflet |
| **vite** | ^4.4 | Bundler |

---

## 🎨 Couleurs & Design

```
Primary   : #E30613 (Cogepart red)
Secondary : #0E284B (Cogepart navy)
Light BG  : #f5f5f5
Border    : #ddd
Error     : #dc3545
Success   : #28A745
```

### Fonts
- System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)

---

## 📱 Responsive Design

- Mobile-first approach
- Max-width: 600px
- Touch-friendly (48px min button height)
- Landscape support

---

## ⚙️ Features

✅ **Camera**
- Avant/arrière
- Upload fichier fallback
- Compression WebP (client-side)

✅ **Vision/OCR**
- Gemini API integration
- JSON extraction
- Confidence scores
- Retry logic (3x)

✅ **Forms**
- Validation
- Autocomplete addresses (Google Places)
- Real-time error feedback

✅ **GPS**
- Geolocation API
- Fallback Marignane
- Display on map

✅ **Historique**
- Filtres (numéro, statut)
- Liste + Carte (Leaflet)
- Modal détail BL
- Photo preview

✅ **UX**
- Loading states
- Error handling
- Infinite scroll (future)
- Toast notifications (future)

---

## 🔌 API Integration

### Endpoints utilisés

```
POST  /api/vision/process-colis    - OCR photo
POST  /api/bl/create               - Créer BL
GET   /api/bl/today                - BL du jour
GET   /api/bl/:id                  - Détail BL
GET   /api/bl/:id/photo            - Photo
GET   /api/geocode/search          - Autocomplete
```

### Retry Logic

Si `/api/vision/process-colis` ou `/api/bl/create` échouent :
- Réessayer 3 fois (délai 2s)
- Afficher erreur après échec

---

## 🗺️ Carte Leaflet

- OpenStreetMap tiles
- Markers avec popup
- Fit bounds automatique
- Colors : red pin pour tous les points

---

## 📂 Structure fichiers

```
frontend/
├── src/
│   ├── main.jsx              - Entry point
│   ├── App.jsx               - Routing
│   ├── api.js                - Fetch helpers
│   ├── utils.js              - Helpers (format, etc)
│   ├── pages/                - Écrans
│   ├── components/           - Composants
│   └── styles/               - CSS
├── public/
├── index.html
├── vite.config.js
├── package.json
└── .env
```

---

## 🔐 Security Notes

- Clés API en `.env` (pas en code)
- Pas de localStorage (future sync)
- Compression images client-side
- CORS configuré backend

---

## 📝 Logs & Debug

Console logs pour :
- API errors
- GPS geolocation
- Vision processing
- Autocomplete queries

---

## 🚀 Deploy

### Local build
```bash
npm run build
npm run preview
```

### Production
```bash
npm run build
# Copy dist/ to server
```

---

## ⚠️ Known Limitations

- Pas de mode offline (sera ajouté)
- Pas de notifications push
- Pas de sync données
- Photos stockées en disque (pas cloud)

---

## 📚 Docs

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Leaflet Docs](https://leafletjs.com/)
- [Axios Docs](https://axios-http.com/)

---

**Créé pour POC Cogepart | Amine**
