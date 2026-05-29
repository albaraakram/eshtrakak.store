const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app           = express();
const PORT          = process.env.PORT || 2555;
const DATA_FILE     = path.join(__dirname, 'clicks.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

function readClicks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeClicks(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeProducts(data) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());

// Add CORS headers so LiveServer or file:// can fetch from port 2555
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve the static site (index.html, logo.png, …)
app.use(express.static(__dirname));

// ── API ───────────────────────────────────────────────────────────────────────

// GET /api/products -> returns all products
app.get('/api/products', (req, res) => {
  res.json(readProducts());
});

// POST /api/products -> save all products (Requires Password)
app.post('/api/products', (req, res) => {
  const password = req.headers['authorization'];
  if (password !== 'HelloWolrd') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const products = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  writeProducts(products);
  res.json({ success: true });
});

// GET /api/clicks  ->  returns all click counts
app.get('/api/clicks', (req, res) => {
  res.json(readClicks());
});

// POST /api/clicks/:id  →  increments count for :id and returns new total
app.post('/api/clicks/:id', (req, res) => {
  const { id } = req.params;

  // Retrieve products dynamically to validate the ID
  const products = readProducts();
  const isValid = products.some(p => p.id === id);

  if (!isValid) {
    return res.status(400).json({ error: 'Unknown subscription id' });
  }

  const data  = readClicks();
  data[id]    = (data[id] || 0) + 1;
  writeClicks(data);

  res.json({ id, count: data[id] });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Server running at http://localhost:${PORT}`);
});
