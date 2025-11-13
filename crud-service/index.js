require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');

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

// Funkcja pomocnicza do wysyłania logów
const logAction = async (level, message, context) => {
  try {
    await axios.post(`${process.env.LOG_SERVICE_URL}/log`, {
      timestamp: new Date().toISOString(),
      level: level,
      service: 'crud-service',
      message: message,
      context: context || {}
    });
  } catch (error) {
    console.error('[CRUD Service] Nie udało się wysłać logu:', error.message);
  }
};

// Middleware
const extractUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    // Logowanie nieautoryzowanej próby
    logAction('warn', 'Próba dostępu bez autoryzacji (brak x-user-id)', { ip: req.ip });
    return res.status(401).json({ error: 'Brak autoryzacji. Oczekiwano nagłówka x-user-id.' });
  }
  req.userId = parseInt(userId, 10);
  next();
};

app.use('/tickets', extractUser);

// CREATE (Stwórz zgłoszenie)
app.post('/tickets', async (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'INSERT INTO tickets (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, userId]
    );
    const newTicket = result.rows[0];
    
    // Logowanie akcji
    await logAction('info', 'Utworzono nowe zgłoszenie', { ticketId: newTicket.id, userId: userId });

    res.status(201).json(newTicket);
  } catch (err) {
    console.error(err);
    await logAction('error', 'Błąd przy tworzeniu zgłoszenia', { error: err.message, userId: userId });
    res.status(500).json({ error: 'Błąd serwera.' });
  }
});

// READ (Pobierz wszystkie zgłoszenia danego użytkownika)
app.get('/tickets', async (req, res) => {
  const userId = req.userId;
  try {
    const result = await pool.query('SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera.' });
  }
});

// READ (Pobierz jedno zgłoszenie)
app.get('/tickets/:id', async (req, res) => {
    const ticketId = parseInt(req.params.id, 10);
    const userId = req.userId;

    try {
        const result = await pool.query('SELECT * FROM tickets WHERE id = $1 AND user_id = $2', [ticketId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Zgłoszenie nie znalezione lub brak uprawnień.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});

// UPDATE (Aktualizuj zgłoszenie)
app.put('/tickets/:id', async (req, res) => {
  const ticketId = parseInt(req.params.id, 10);
  const { title, description, status } = req.body;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'UPDATE tickets SET title = $1, description = $2, status = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, description, status, ticketId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Zgłoszenie nie znalezione lub brak uprawnień.' });
    }
    
    await logAction('info', 'Zaktualizowano zgłoszenie', { ticketId: ticketId, userId: userId });
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    await logAction('error', 'Błąd przy aktualizacji zgłoszenia', { error: err.message, ticketId: ticketId, userId: userId });
    res.status(500).json({ error: 'Błąd serwera.' });
  }
});

// DELETE (Usuń zgłoszenie)
app.delete('/tickets/:id', async (req, res) => {
    const ticketId = parseInt(req.params.id, 10);
    const userId = req.userId;

    try {
        const result = await pool.query(
            'DELETE FROM tickets WHERE id = $1 AND user_id = $2 RETURNING *', 
            [ticketId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Zgłoszenie nie znalezione lub brak uprawnień.' });
        }

        await logAction('info', 'Usunięto zgłoszenie', { ticketId: ticketId, userId: userId });
        res.status(200).json({ message: 'Zgłoszenie usunięte.' }); // Lub 204 No Content

    } catch (err) {
        console.error(err);
        await logAction('error', 'Błąd przy usuwaniu zgłoszenia', { error: err.message, ticketId: ticketId, userId: userId });
        res.status(500).json({ error: 'Błąd serwera.' });
    }
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[CRUD Service] Uruchomiony na porcie ${PORT}`);
});