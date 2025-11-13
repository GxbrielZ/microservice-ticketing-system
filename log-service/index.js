require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Konfiguracja Bazy Danych
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Zapisz nowy log
app.post('/log', async (req, res) => {
  const { timestamp, level, service, message, context } = req.body;

  if (!timestamp || !level || !service || !message) {
    return res.status(400).json({ error: 'Brakuje wymaganych pól logu.' });
  }

  try {
    await pool.query(
      'INSERT INTO system_logs (timestamp, level, service, message, context) VALUES ($1, $2, $3, $4, $5)',
      [timestamp, level, service, message, context || {}]
    );
    res.status(201).json({ status: 'Log zapisany.' });
  } catch (err) {
    console.error('Błąd zapisu logu:', err);
    res.status(500).json({ error: 'Błąd serwera podczas zapisu logu.' });
  }
});

// Odczytaj logi
app.get('/logs', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const result = await pool.query(
      'SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Błąd odczytu logów:', err);
    res.status(500).json({ error: 'Błąd serwera podczas odczytu logów.' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[Log Service] Uruchomiony na porcie ${PORT}`);
});