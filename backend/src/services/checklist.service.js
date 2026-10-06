const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { textoRequerido } = require('../utils/validar');
const situaciones = require('./situaciones.service');
const plantillas = require('../data/plantillas');

const aBooleano = (fila) => ({ ...fila, completado: !!fila.completado });

async function listar(idSituacion, idUsuario) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const [rows] = await pool.query(
    'SELECT * FROM checklist WHERE id_situacion = ? ORDER BY id_checklist', [idSituacion]
  );
  return rows.map(aBooleano);
}

async function obtenerItem(idSituacion, idItem, idUsuario) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const [rows] = await pool.query(
    'SELECT * FROM checklist WHERE id_checklist = ? AND id_situacion = ?', [idItem, idSituacion]
  );
  if (!rows[0]) throw new HttpError(404, 'Ítem no encontrado');
  return aBooleano(rows[0]);
}

async function crear(idSituacion, idUsuario, datos) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const item = textoRequerido(datos.item, 'item', 255);
  const [r] = await pool.query(
    'INSERT INTO checklist (id_situacion, item) VALUES (?, ?)', [idSituacion, item]
  );
  await situaciones.recalcularProgreso(idSituacion);
  return obtenerItem(idSituacion, r.insertId, idUsuario);
}

async function actualizar(idSituacion, idItem, idUsuario, datos) {
  const actual = await obtenerItem(idSituacion, idItem, idUsuario);
  const item = datos.item !== undefined ? textoRequerido(datos.item, 'item', 255) : actual.item;
  let completado = actual.completado;
  if (datos.completado !== undefined) {
    if (typeof datos.completado !== 'boolean') throw new HttpError(400, 'completado debe ser true o false');
    completado = datos.completado;
  }
  await pool.query(
    'UPDATE checklist SET item = ?, completado = ? WHERE id_checklist = ?', [item, completado, idItem]
  );
  await situaciones.recalcularProgreso(idSituacion);
  return obtenerItem(idSituacion, idItem, idUsuario);
}

async function eliminar(idSituacion, idItem, idUsuario) {
  await obtenerItem(idSituacion, idItem, idUsuario);
  await pool.query('DELETE FROM checklist WHERE id_checklist = ?', [idItem]);
  await situaciones.recalcularProgreso(idSituacion);
}

// Crea los ítems sugeridos para la categoría (sin repetir los que ya existen).
async function generar(idSituacion, idUsuario) {
  const sit = await situaciones.obtenerPropia(idSituacion, idUsuario);
  const [[cat]] = await pool.query('SELECT nombre FROM categorias WHERE id_categoria = ?', [sit.id_categoria]);
  const sugeridos = (plantillas[cat.nombre] || { checklist: [] }).checklist;

  const [existentes] = await pool.query('SELECT item FROM checklist WHERE id_situacion = ?', [idSituacion]);
  const yaTiene = new Set(existentes.map((e) => e.item));
  const nuevos = sugeridos.filter((i) => !yaTiene.has(i)).map((i) => [idSituacion, i]);

  if (nuevos.length) {
    await pool.query('INSERT INTO checklist (id_situacion, item) VALUES ?', [nuevos]);
    await situaciones.recalcularProgreso(idSituacion);
  }
  return listar(idSituacion, idUsuario);
}

module.exports = { listar, crear, actualizar, eliminar, generar };
