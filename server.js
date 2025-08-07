// Simple Venice Balances Backend (CommonJS)
// In-memory storage. Single endpoint /api/balances supporting GET (public) and POST (NOW TEMPORARILY PUBLIC for n8n testing)
// Minimal & clear.

const express = require('express');
const basicAuth = require('basic-auth');
const cors = require('cors');
require('dotenv').config();

// Validate required environment variables
if (!process.env.API_USER || !process.env.API_PASS) {
  console.error('ERROR: API_USER and API_PASS environment variables are required');
  process.exit(1);
}

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request size limit to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(cors()); // Open CORS for simplicity

let latest = null; // { balances: { VCU: number, DIEM: number }, timestamp: string }

// ================= AUTH =================
function auth(req, res, next) {
  const creds = basicAuth(req);
  
  // Don't log sensitive auth info in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Auth attempt:', { 
      received: creds ? { name: creds.name, pass: '***' } : null,
      expected: { name: process.env.API_USER, pass: '***' }
    });
  }
  
  if (!creds || creds.name !== process.env.API_USER || creds.pass !== process.env.API_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth failed');
    }
    res.set('WWW-Authenticate', 'Basic realm="balances"');
    return res.status(401).json({ error: 'unauthorized' });
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('Auth success');
  }
  next();
}
// ==========================================

// Helper to validate and coerce numeric values
function toNum(val) {
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || val < 0) return null;
    return val;
  }
  if (typeof val === 'string' && val.trim() !== '') {
    const num = Number(val.trim());
    if (!Number.isFinite(num) || num < 0) return null;
    return num;
  }
  return null;
}

// Validate timestamp format
function isValidTimestamp(ts) {
  if (typeof ts !== 'string') return false;
  try {
    const date = new Date(ts);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

// POST endpoint with Basic Auth
app.post('/api/balances', auth, (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('POST /api/balances with auth - raw body:', req.body);
    }
    
    const { balances, timestamp } = req.body || {};
    
    // Validate payload structure
    if (!balances || typeof balances !== 'object') {
      return res.status(400).json({ 
        error: 'invalid payload', 
        detail: 'missing or invalid balances object' 
      });
    }
    
    // Validate required balance fields
    if (!('VCU' in balances) || !('DIEM' in balances)) {
      return res.status(400).json({ 
        error: 'invalid payload', 
        detail: 'balances must contain VCU and DIEM fields' 
      });
    }
    
    const vcu = toNum(balances.VCU);
    const diem = toNum(balances.DIEM);
    
    if (vcu === null || diem === null) {
      return res.status(400).json({ 
        error: 'invalid payload', 
        detail: 'VCU and DIEM must be non-negative numbers' 
      });
    }
    
    // Validate timestamp if provided
    let ts = new Date().toISOString();
    if (timestamp) {
      if (!isValidTimestamp(timestamp)) {
        return res.status(400).json({ 
          error: 'invalid payload', 
          detail: 'timestamp must be a valid ISO 8601 string' 
        });
      }
      ts = timestamp;
    }
    
    latest = { 
      balances: { VCU: vcu, DIEM: diem }, 
      timestamp: ts,
      lastUpdated: new Date().toISOString()
    };
    
    return res.json({ status: 'ok', data: latest });
    
  } catch (error) {
    console.error('Error processing POST /api/balances:', error);
    return res.status(500).json({ error: 'internal server error' });
  }
});

app.get('/api/balances', (_req, res) => {
  if (!latest) return res.status(404).json({ error: 'no data yet' });
  res.json(latest);
});

// Webhook trigger endpoint for force update
app.post('/api/trigger-update', async (req, res) => {
  try {
    const response = await fetch('https://n8n.bitwiki.org/webhook/5777be58-9a54-4524-a1fc-5d6ef88931a3', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    res.json({ status: 'ok', message: 'update triggered' });
  } catch (error) {
    console.error('Webhook trigger error:', error);
    res.status(500).json({ error: 'failed to trigger update' });
  }
});

app.use('/', express.static('frontend'));

app.get('/healthz', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'not found', path: req.originalUrl });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3000;

// Validate PORT
const portNum = parseInt(PORT, 10);
if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
  console.error('ERROR: Invalid PORT value:', PORT);
  process.exit(1);
}

const server = app.listen(portNum, () => {
  console.log(`Balances backend listening on :${portNum} with Basic Auth enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
