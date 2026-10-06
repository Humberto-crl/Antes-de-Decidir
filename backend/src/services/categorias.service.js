const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { textoRequerido, textoOpcional } = require('../utils/validar');

async function obtenerTodas() {
  const [rows] = await pool.query('SELECT * FROM categorias ORDER BY id_categoria');
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.query('SELECT * FROM categorias WHERE id_categoria = ?', [id]);
  if (!rows[0]) throw new HttpError(404, 'Categoría no encontrada');
  return rows[0];
}

async function crear(datos) {
  const nombre = textoRequerido(datos.nombre, 'nombre', 100);
  const descripcion = textoOpcional(datos.descripcion);
  const [r] = await pool.query(
    'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
    [nombre, descripcion]
  );
  return { id_categoria: r.insertId, nombre, descripcion };
}

async function actualizar(id, datos) {
  const actual = await obtenerPorId(id);
  const nombre = datos.nombre !== undefined ? textoRequerido(datos.nombre, 'nombre', 100) : actual.nombre;
  const descripcion = datos.descripcion !== undefined ? textoOpcional(datos.descripcion) : actual.descripcion;
  await pool.query(
    'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
    [nombre, descripcion, id]
  );
  return { id_categoria: id, nombre, descripcion };
}

async function eliminar(id) {
  const [r] = await pool.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
  if (r.affectedRows === 0) throw new HttpError(404, 'Categoría no encontrada');
}

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
