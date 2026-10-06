const pool = require('../config/db');

// Deja constancia en el historial de lo que hizo el usuario con una situación.
async function registrarHistorial(idUsuario, idSituacion, accion) {
  await pool.query(
    'INSERT INTO historial (id_usuario, id_situacion, accion) VALUES (?, ?, ?)',
    [idUsuario, idSituacion, accion]
  );
}

// "Mi camino": todas las situaciones del usuario con su estado y progreso.
async function miCamino(idUsuario) {
  const [situaciones] = await pool.query(
    `SELECT s.id_situacion, s.titulo, s.estado, s.progreso, s.fecha_creacion,
            s.fecha_actualizacion, c.nombre AS categoria
       FROM situaciones s
       JOIN categorias c ON c.id_categoria = s.id_categoria
      WHERE s.id_usuario = ?
      ORDER BY s.fecha_actualizacion DESC`,
    [idUsuario]
  );
  const resumen = { total: situaciones.length, no_iniciado: 0, pendiente: 0, en_progreso: 0, completado: 0 };
  situaciones.forEach((s) => { resumen[s.estado] += 1; });
  return { resumen, situaciones };
}

async function historial(idUsuario, limite = 50) {
  const [rows] = await pool.query(
    `SELECT h.id_historial, h.accion, h.fecha, s.id_situacion, s.titulo, c.nombre AS categoria
       FROM historial h
       JOIN situaciones s ON s.id_situacion = h.id_situacion
       JOIN categorias c ON c.id_categoria = s.id_categoria
      WHERE h.id_usuario = ?
      ORDER BY h.fecha DESC, h.id_historial DESC
      LIMIT ?`,
    [idUsuario, limite]
  );
  return rows;
}

module.exports = { registrarHistorial, miCamino, historial };
