const pool = require('../config/db');

// Ejecuta varias consultas como una sola unidad: o se guardan todas o ninguna.
async function conTransaccion(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = { conTransaccion };
