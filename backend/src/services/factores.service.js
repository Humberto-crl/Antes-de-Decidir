const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { entero, textoRequerido, textoOpcional } = require('../utils/validar');

async function listar(idCategoria) {
  if (idCategoria) {
    const [rows] = await pool.query(
      'SELECT * FROM factores WHERE id_categoria = ? ORDER BY id_factor',
      [entero(idCategoria, 'categoria')]
    );
    return rows;
  }
  const [rows] = await pool.query('SELECT * FROM factores ORDER BY id_categoria, id_factor');
  return rows;
}

async function obtenerPorId(id) {
  const [rows] = await pool.query('SELECT * FROM factores WHERE id_factor = ?', [id]);
  if (!rows[0]) throw new HttpError(404, 'Factor no encontrado');
  return rows[0];
}

async function crear(datos) {
  const id_categoria = entero(datos.id_categoria, 'id_categoria');
  const nombre = textoRequerido(datos.nombre, 'nombre', 100);
  const descripcion = textoOpcional(datos.descripcion);
  const [r] = await pool.query(
    'INSERT INTO factores (id_categoria, nombre, descripcion) VALUES (?, ?, ?)',
    [id_categoria, nombre, descripcion]
  );
  return { id_factor: r.insertId, id_categoria, nombre, descripcion };
}

async function actualizar(id, datos) {
  const actual = await obtenerPorId(id);
  const nombre = datos.nombre !== undefined ? textoRequerido(datos.nombre, 'nombre', 100) : actual.nombre;
  const descripcion = datos.descripcion !== undefined ? textoOpcional(datos.descripcion) : actual.descripcion;
  const id_categoria = datos.id_categoria !== undefined ? entero(datos.id_categoria, 'id_categoria') : actual.id_categoria;
  await pool.query(
    'UPDATE factores SET id_categoria = ?, nombre = ?, descripcion = ? WHERE id_factor = ?',
    [id_categoria, nombre, descripcion, id]
  );
  return { id_factor: id, id_categoria, nombre, descripcion };
}

async function eliminar(id) {
  const [r] = await pool.query('DELETE FROM factores WHERE id_factor = ?', [id]);
  if (r.affectedRows === 0) throw new HttpError(404, 'Factor no encontrado');
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
