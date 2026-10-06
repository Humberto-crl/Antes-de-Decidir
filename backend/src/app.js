const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'Antes de Decidir API funcionando' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    res.json({ ok: true, resultado: rows[0].resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'No se pudo conectar a la base de datos' });
  }
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categorias', require('./routes/categorias.routes'));
app.use('/api/factores', require('./routes/factores.routes'));
app.use('/api/situaciones', require('./routes/situaciones.routes'));
app.use('/api/herramientas', require('./routes/herramientas.routes'));
app.use('/api', require('./routes/camino.routes'));

// Siempre al final: rutas inexistentes y manejo de errores
app.use(notFound);
app.use(errorHandler);

module.exports = app;
