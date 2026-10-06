const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { conTransaccion } = require('../utils/transaccion');
const { entero, textoRequerido, textoOpcional } = require('../utils/validar');
const situaciones = require('./situaciones.service');

function prepararFactores(idAlternativa, factores) {
  if (factores === undefined) return null;
  if (!Array.isArray(factores)) throw new HttpError(400, 'factores debe ser una lista');
  return factores
    .filter((f) => f && String(f.valor ?? '').trim() !== '')
    .map((f) => [idAlternativa, entero(f.id_factor, 'id_factor'), String(f.valor).trim().slice(0, 255)]);
}

async function obtener(idSituacion, idAlternativa, idUsuario) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const lista = await situaciones.alternativasConValores(idSituacion);
  const alt = lista.find((a) => a.id_alternativa === idAlternativa);
  if (!alt) throw new HttpError(404, 'Alternativa no encontrada');
  return alt;
}

async function listar(idSituacion, idUsuario) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  return situaciones.alternativasConValores(idSituacion);
}

async function crear(idSituacion, idUsuario, datos) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const nombre = textoRequerido(datos.nombre, 'nombre', 100);
  const descripcion = textoOpcional(datos.descripcion);

  const id = await conTransaccion(async (conn) => {
    const [r] = await conn.query(
      'INSERT INTO alternativas (id_situacion, nombre, descripcion) VALUES (?, ?, ?)',
      [idSituacion, nombre, descripcion]
    );
    const filas = prepararFactores(r.insertId, datos.factores);
    if (filas && filas.length) {
      await conn.query('INSERT INTO alternativa_factor (id_alternativa, id_factor, valor) VALUES ?', [filas]);
    }
    return r.insertId;
  });
  return obtener(idSituacion, id, idUsuario);
}

async function actualizar(idSituacion, idAlternativa, idUsuario, datos) {
  const actual = await obtener(idSituacion, idAlternativa, idUsuario);
  const nombre = datos.nombre !== undefined ? textoRequerido(datos.nombre, 'nombre', 100) : actual.nombre;
  const descripcion = datos.descripcion !== undefined ? textoOpcional(datos.descripcion) : actual.descripcion;

  await conTransaccion(async (conn) => {
    await conn.query(
      'UPDATE alternativas SET nombre = ?, descripcion = ? WHERE id_alternativa = ?',
      [nombre, descripcion, idAlternativa]
    );
    const filas = prepararFactores(idAlternativa, datos.factores);
    if (filas) { // si mandan factores, se reemplazan todos
      await conn.query('DELETE FROM alternativa_factor WHERE id_alternativa = ?', [idAlternativa]);
      if (filas.length) {
        await conn.query('INSERT INTO alternativa_factor (id_alternativa, id_factor, valor) VALUES ?', [filas]);
      }
    }
  });
  return obtener(idSituacion, idAlternativa, idUsuario);
}

async function eliminar(idSituacion, idAlternativa, idUsuario) {
  await obtener(idSituacion, idAlternativa, idUsuario);
  await pool.query('DELETE FROM alternativas WHERE id_alternativa = ?', [idAlternativa]);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
