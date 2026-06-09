import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// ===== CONFIG =====
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const STORAGE_PATH = path.join(__dirname, process.env.STORAGE_PATH || './storage');
const DB_PATH = path.join(__dirname, process.env.DB_PATH || './bl.db');

// Ensure storage directory exists
await fs.ensureDir(STORAGE_PATH);

// API Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: '*',  // Accepte tout
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(STORAGE_PATH));

// ===== DATABASE SETUP =====
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('❌ DB Error:', err);
  else console.log('✅ SQLite connected');
});

// Promisify DB calls
const dbRun = (sql, params = []) =>
  new Promise((res, rej) =>
    db.run(sql, params, function(err) {
      if (err) rej(err);
      else res(this.lastID);
    })
  );

const dbAll = (sql, params = []) =>
  new Promise((res, rej) =>
    db.all(sql, params, (err, rows) => {
      if (err) rej(err);
      else res(rows || []);
    })
  );

const dbGet = (sql, params = []) =>
  new Promise((res, rej) =>
    db.get(sql, params, (err, row) => {
      if (err) rej(err);
      else res(row);
    })
  );

// Initialize database tables
const initDB = async () => {
  const createBLTable = `
    CREATE TABLE IF NOT EXISTS bl (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE NOT NULL,
      adresse_depart TEXT DEFAULT 'RENAULT-MARIGNANE',
      adresse_destination TEXT NOT NULL,
      poids REAL,
      dimensions TEXT,
      contenu TEXT,
      info_complementaire TEXT,
      description_ai TEXT,
      gps_lat REAL NOT NULL,
      gps_lng REAL NOT NULL,
      gps_adresse TEXT,
      photo_path TEXT,
      statut TEXT DEFAULT 'créé',
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_transmission DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bl_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bl_id INTEGER UNIQUE NOT NULL,
      photo_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(bl_id) REFERENCES bl(id)
    );
  `;

  return new Promise((res, rej) => {
    db.exec(createBLTable, (err) => {
      if (err) rej(err);
      else {
        console.log('✅ Tables initialized');
        res();
      }
    });
  });
};

await initDB().catch(console.error);

// ===== HELPERS =====
const getToday = () => new Date().toISOString().split('T')[0];

const sanitizeFilename = (str) => str.replace(/[^a-zA-Z0-9_-]/g, '_');

// ===== ENDPOINTS =====

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /api/vision/process-colis
app.post('/api/vision/process-colis', async (req, res) => {
  try {
    const { photo_base64 } = req.body;

    if (!photo_base64) {
      return res.status(400).json({ success: false, error: 'Photo manquante' });
    }

    console.log('📸 Processing vision...');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const base64Data = photo_base64.includes(',') 
      ? photo_base64.split(',')[1] 
      : photo_base64;

    const imageParts = [
      {
        inlineData: {
          mimeType: 'image/webp',
          data: base64Data
        }
      }
    ];

    // ===== PROMPT 1 : Vision + OCR =====
    const ocrPrompt = `Analyse cette photo de colis et extrais les informations en JSON VALIDE.

INSTRUCTIONS:
- Réponds UNIQUEMENT avec du JSON valide, sans backticks, sans texte avant ou après
- Si information non détectée, mets null ou vide ""
- Confiance: 0.0 à 1.0 (0.95 = très certain)

{
  "numero_bl": "ABC12345 ou null",
  "numero_confiance": 0.95,
  
  "adresse_destination": "123 Rue de Paris, 75000 Paris ou null",
  "adresse_confiance": 0.85,
  
  "poids": 2.5,
  "poids_unite": "kg",
  "poids_confiance": 0.7,
  
  "dimensions": "30x20x15 ou null",
  "dimensions_confiance": 0.8,
  
  "contenu": "Electronique, boîte ou null",
  "contenu_confiance": 0.9,
  
  "info_complementaire": "Code barre: 1234567890, Expédient: AMAZON ou vide",
  
  "raw_ocr": "Texte brut OCR du colis"
}`;

    const visionResponse = await model.generateContent([
      ...imageParts,
      { text: ocrPrompt }
    ]);

    let visionData = {
      numero_bl: null,
      numero_confiance: 0,
      adresse_destination: null,
      adresse_confiance: 0,
      poids: null,
      poids_unite: 'kg',
      poids_confiance: 0,
      dimensions: null,
      dimensions_confiance: 0,
      contenu: null,
      contenu_confiance: 0,
      info_complementaire: '',
      raw_ocr: ''
    };

    try {
      const responseText = visionResponse.response.text();
      console.log('🔍 Vision response:', responseText.substring(0, 200));
      visionData = JSON.parse(responseText);
    } catch (parseErr) {
      console.log('⚠️ Vision parsing error:', parseErr.message);
      // Keep defaults
    }

    // ===== PROMPT 2 : Description IA =====
    let descriptionAI = '';
    try {
      const descPrompt = `Décris ce colis en UNE SEULE phrase courte (max 15 mots).
Format: "Colis [état], couleur [couleur], [forme], [remarques]"

Exemples:
- "Colis bon état, marron, rectangulaire, pas de dégâts"
- "Colis abîmé, noir, carré, coin plié"
- "Colis neuf, blanc, cylindrique, bien emballé"

Réponds UNIQUEMENT la phrase, rien d'autre.`;

      const descResponse = await model.generateContent([
        ...imageParts,
        { text: descPrompt }
      ]);

      descriptionAI = descResponse.response.text().trim();
      console.log('✨ Description:', descriptionAI);
    } catch (descErr) {
      console.log('⚠️ Description error:', descErr.message);
      descriptionAI = `Colis ${visionData.contenu || 'non identifié'}, état à vérifier`;
    }

    res.json({
      success: true,
      ...visionData,
      description_ai: descriptionAI
    });

  } catch (error) {
    console.error('❌ Vision endpoint error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur vision/OCR' 
    });
  }
});

// POST /api/bl/create
app.post('/api/bl/create', async (req, res) => {
  try {
    const {
      numero_bl,
      adresse_destination,
      photo_base64,
      gps_lat,
      gps_lng,
      poids,
      dimensions,
      contenu,
      info_complementaire,
      description_ai,
      gps_adresse
    } = req.body;

    // Validation
    const errors = {};
    if (!numero_bl) errors.numero_bl = 'Obligatoire';
    if (!adresse_destination) errors.adresse_destination = 'Obligatoire';
    if (!photo_base64) errors.photo_base64 = 'Photo manquante';
    if (gps_lat === undefined) errors.gps_lat = 'GPS latitude manquante';
    if (gps_lng === undefined) errors.gps_lng = 'GPS longitude manquante';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Check numero unique
    const existing = await dbGet('SELECT id FROM bl WHERE numero = ?', [numero_bl]);
    if (existing) {
      return res.status(400).json({
        success: false,
        errors: { numero_bl: 'Numéro BL déjà existant' }
      });
    }

    // Créer dossier storage par date
    const today = getToday();
    const storagePath = path.join(STORAGE_PATH, today);
    await fs.ensureDir(storagePath);

    // Sauvegarder photo
    const filename = `bl_${sanitizeFilename(numero_bl)}.webp`;
    const photoPath = path.join(storagePath, filename);
    const base64Data = photo_base64.includes(',') 
      ? photo_base64.split(',')[1] 
      : photo_base64;
    const buffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(photoPath, buffer);

    console.log('📸 Photo saved:', filename);

    // INSERT BL
    const blID = await dbRun(
      `INSERT INTO bl (numero, adresse_destination, poids, dimensions, contenu, info_complementaire, description_ai, gps_lat, gps_lng, gps_adresse, photo_path, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_bl,
        adresse_destination,
        poids || null,
        dimensions || null,
        contenu || null,
        info_complementaire || null,
        description_ai || null,
        gps_lat,
        gps_lng,
        gps_adresse || null,
        `/${today}/${filename}`,
        'créé'
      ]
    );

    const bl = await dbGet('SELECT * FROM bl WHERE id = ?', [blID]);

    console.log(`✅ BL ${numero_bl} created (ID: ${blID})`);

    // Auto-transmission après 10-15s
    const delayMs = 10000 + Math.random() * 5000;
    setTimeout(async () => {
      try {
        await dbRun(
          'UPDATE bl SET statut = ?, date_transmission = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['transmis au chauffeur', blID]
        );
        console.log(`🚗 BL ${numero_bl} transmitted to driver`);
      } catch (err) {
        console.error('❌ Auto-transmission error:', err.message);
      }
    }, delayMs);

    res.status(201).json({ 
      success: true, 
      bl,
      message: `BL créé. Transmission au chauffeur dans ${Math.round(delayMs/1000)}s...`
    });

  } catch (error) {
    console.error('❌ Create BL error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bl/today
app.get('/api/bl/today', async (req, res) => {
  try {
    const { search, statut, sort = '-date_creation' } = req.query;
    const today = getToday();

    let sql = `SELECT * FROM bl WHERE DATE(date_creation) = ?`;
    const params = [today];

    if (search) {
      sql += ` AND (numero LIKE ? OR adresse_destination LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (statut && statut !== 'tous') {
      sql += ` AND statut = ?`;
      params.push(statut);
    }

    sql += sort === '-date_creation' 
      ? ' ORDER BY date_creation DESC' 
      : ' ORDER BY date_creation ASC';

    const bl = await dbAll(sql, params);

    res.json({ 
      success: true, 
      count: bl.length, 
      date: today, 
      bl 
    });

  } catch (error) {
    console.error('❌ Get today error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bl
app.get('/api/bl', async (req, res) => {
  try {
    const { date_from, date_to, search, statut } = req.query;

    let sql = 'SELECT * FROM bl WHERE 1=1';
    const params = [];

    if (date_from) {
      sql += ` AND DATE(date_creation) >= ?`;
      params.push(date_from);
    }
    if (date_to) {
      sql += ` AND DATE(date_creation) <= ?`;
      params.push(date_to);
    }
    if (search) {
      sql += ` AND (numero LIKE ? OR adresse_destination LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (statut && statut !== 'tous') {
      sql += ` AND statut = ?`;
      params.push(statut);
    }

    sql += ' ORDER BY date_creation DESC';
    const bl = await dbAll(sql, params);

    res.json({ success: true, count: bl.length, bl });

  } catch (error) {
    console.error('❌ Get all error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bl/:id
app.get('/api/bl/:id', async (req, res) => {
  try {
    const bl = await dbGet('SELECT * FROM bl WHERE id = ?', [req.params.id]);

    if (!bl) {
      return res.status(404).json({ success: false, error: 'BL non trouvé' });
    }

    res.json({ success: true, bl });

  } catch (error) {
    console.error('❌ Get BL error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bl/:id/photo
app.get('/api/bl/:id/photo', async (req, res) => {
  try {
    const bl = await dbGet('SELECT photo_path FROM bl WHERE id = ?', [req.params.id]);

    if (!bl || !bl.photo_path) {
      return res.status(404).json({ success: false, error: 'Photo non trouvée' });
    }

    const photoPath = path.join(STORAGE_PATH, bl.photo_path);
    const exists = await fs.pathExists(photoPath);

    if (!exists) {
      return res.status(404).json({ success: false, error: 'Fichier photo non trouvé' });
    }

    res.setHeader('Cache-Control', 'max-age=31536000'); // 1 year
    res.sendFile(photoPath);

  } catch (error) {
    console.error('❌ Get photo error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bl/:id/update-status
app.post('/api/bl/:id/update-status', async (req, res) => {
  try {
    const { statut } = req.body;

    if (!statut) {
      return res.status(400).json({ success: false, error: 'Statut manquant' });
    }

    const validStatuts = ['créé', 'transmis au chauffeur'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ success: false, error: 'Statut invalide' });
    }

    await dbRun(
      'UPDATE bl SET statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [statut, req.params.id]
    );

    const bl = await dbGet('SELECT * FROM bl WHERE id = ?', [req.params.id]);

    console.log(`🔄 BL ${bl.numero} status updated to: ${statut}`);

    res.json({ success: true, bl });

  } catch (error) {
    console.error('❌ Update status error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/geocode/search - Google Places Autocomplete
app.get('/api/geocode/search', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input: q,
          key: GOOGLE_PLACES_KEY,
          language: 'fr',
          components: 'country:fr',
          sessiontoken: crypto.randomUUID()
        },
        timeout: 5000
      }
    );

    const suggestions = (response.data.predictions || [])
      .slice(0, parseInt(limit))
      .map(p => ({
        label: p.description,
        place_id: p.place_id
      }));

    res.json({ success: true, suggestions });

  } catch (error) {
    console.error('⚠️ Geocode error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur géocodage'
    });
  }
});

// ===== ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint non trouvé' });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Erreur serveur' 
  });
});

// ===== START SERVER =====
app.listen(PORT,'0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 BACKEND RUNNING                   ║
╠════════════════════════════════════════╣
║ API        : http://0.0.0.0:${PORT}       ║
║ Database   : ${DB_PATH}             ║
║ Storage    : ${STORAGE_PATH}          ║
║ Env        : ${process.env.NODE_ENV}         ║
╚════════════════════════════════════════╝
  `);
});

process.on('SIGINT', () => {
  console.log('\n👋 Closing server...');
  db.close();
  process.exit(0);
});
