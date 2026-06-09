# BL Backend - Gestion Bordereaux Cogepart

API Express.js + SQLite pour la gestion des bordereaux avec OCR/Vision via Gemini API.

## 📋 Démarrage rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration

Créer un fichier `.env` (copie de `.env` fourni) et remplir les clés :

```
```

### 3. Lancer le serveur

```bash
# Développement (avec hot reload)
npm run dev

# Production
npm start
```

✅ API disponible sur **http://localhost:3000**

---

## 🔌 Endpoints API

### Vision & OCR

**POST** `/api/vision/process-colis`
```json
{
  "photo_base64": "iVBORw0KGgo..."
}
```

Response:
```json
{
  "success": true,
  "numero_bl": "ABC12345",
  "numero_confiance": 0.95,
  "adresse_destination": "123 Rue de Paris, 75000",
  "adresse_confiance": 0.85,
  "poids": 2.5,
  "poids_unite": "kg",
  "dimensions": "30x20x15",
  "contenu": "Electronique",
  "info_complementaire": "Code barre: ...",
  "description_ai": "Colis bon état, marron, rectangulaire, pas de dégâts"
}
```

### Créer un BL

**POST** `/api/bl/create`
```json
{
  "numero_bl": "ABC12345",
  "adresse_destination": "123 Rue de Paris, 75000",
  "photo_base64": "iVBORw0KGgo...",
  "gps_lat": 48.5432,
  "gps_lng": 5.1234,
  "poids": 2.5,
  "dimensions": "30x20x15",
  "contenu": "Electronique",
  "description_ai": "Colis bon état..."
}
```

### Lister les BL du jour

**GET** `/api/bl/today?search=ABC&statut=créé`

### Lister tous les BL

**GET** `/api/bl?date_from=2026-06-14&date_to=2026-06-14&statut=tous`

### Détail d'un BL

**GET** `/api/bl/:id`

### Photo d'un BL

**GET** `/api/bl/:id/photo`

### Mettre à jour le statut

**POST** `/api/bl/:id/update-status`
```json
{
  "statut": "transmis au chauffeur"
}
```

### Autocomplete adresses

**GET** `/api/geocode/search?q=Paris&limit=5`

---

## 🗂️ Structure

```
backend/
├── .env                 # Config (secrets)
├── .gitignore
├── package.json
├── server.js            # API Express (tout-en-un)
├── storage/             # Photos disque
│   └── 2026-06-14/
│       ├── bl_ABC12345.webp
│       └── bl_DEF67890.webp
└── bl.db                # Database SQLite
```

## 💾 Database

Tables créées automatiquement :

### `bl` (Bordereaux)
```
id, numero, adresse_depart, adresse_destination, poids, dimensions,
contenu, info_complementaire, description_ai, gps_lat, gps_lng,
gps_adresse, photo_path, statut, date_creation, date_transmission
```

### `bl_photos` (Photos)
```
id, bl_id, photo_path, created_at
```

## 🔑 Environment Variables

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port serveur | `3000` |
| `GEMINI_API_KEY` | Clé Gemini API | `AQ.Ab8...` |
| `GOOGLE_PLACES_API_KEY` | Clé Google Places | `AIzaSy...` |
| `STORAGE_PATH` | Dossier photos | `./storage` |
| `DB_PATH` | Chemin DB SQLite | `./bl.db` |
| `FRONTEND_URL` | URL frontend (CORS) | `http://localhost:5173` |

## 🛠️ Commandes

```bash
# Installer dépendances
npm install

# Développement (nodemon)
npm run dev

# Production
npm start

# Nettoyer storage
rm -rf storage/*
```

## 📊 Coûts API

### Gemini API
- Vision (image) : $0.0001
- Text (description) : $0.00001
- **Total par BL : ~$0.0002**

### Google Places API
- Autocomplete : usage gratuit inclus (limite quota)

**Pour 100 BL/jour** : ~$0.02/jour = $0.60/mois

## ⚠️ Troubleshooting

### "Gemini API key invalid"
- Vérifier `.env` GEMINI_API_KEY
- Confirmer clé active sur https://aistudio.google.com/app/apikey

### "Cannot find module 'express'"
- Lancer `npm install`

### "SQLITE_CANTOPEN"
- Backend crée `bl.db` automatiquement
- Vérifier permissions disque

### Photos ne s'affichent pas
- Vérifier dossier `storage/` existe
- Vérifier chemin photo en DB : `SELECT photo_path FROM bl;`

## 📝 Notes

- Transmission auto au chauffeur : **10-15s après création**
- Photos compressées en WebP (client-side)
- Cache photos : 1 an (HTTP header)
- DB locale SQLite (facile à backup/migrer)

## 📚 Docs

- [Gemini API Docs](https://ai.google.dev/)
- [Google Places API](https://developers.google.com/maps/documentation/places)
- [Express.js](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)

---

**Créé pour POC Cogepart | Amine**
