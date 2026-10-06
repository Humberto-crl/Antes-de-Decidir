const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { conTransaccion } = require('../utils/transaccion');
const { entero, textoRequerido, textoOpcional, parseJson } = require('../utils/validar');
const { registrarHistorial } = require('./camino.service');
const plantillas = require('../data/plantillas');

const ESTADOS = ['no_iniciado', 'pendiente', 'en_progreso', 'completado'];

// Devuelve la situación solo si pertenece al usuario. Si no, 404
// (así no se revela si la situación de otra persona existe).
async function obtenerPropia(idSituacion, idUsuario) {
  const [rows] = await pool.query(
    'SELECT * FROM situaciones WHERE id_situacion = ? AND id_usuario = ?',
    [idSituacion, idUsuario]
  );
  if (!rows[0]) throw new HttpError(404, 'Situación no encontrada');
  return rows[0];
}

async function listar(idUsuario, { categoria, estado } = {}) {
  let sql = `SELECT s.*, c.nombre AS categoria
               FROM situaciones s
               JOIN categorias c ON c.id_categoria = s.id_categoria
              WHERE s.id_usuario = ?`;
  const params = [idUsuario];
  if (categoria) {
    sql += ' AND s.id_categoria = ?';
    params.push(entero(categoria, 'categoria'));
  }
  if (estado) {
    if (!ESTADOS.includes(estado)) throw new HttpError(400, 'estado inválido');
    sql += ' AND s.estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY s.fecha_creacion DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Alternativas de una situación junto con sus valores por factor.
async function alternativasConValores(idSituacion) {
  const [alts] = await pool.query(
    'SELECT * FROM alternativas WHERE id_situacion = ? ORDER BY id_alternativa',
    [idSituacion]
  );
  if (alts.length === 0) return [];
  const [valores] = await pool.query(
    `SELECT af.id_alternativa, af.id_factor, f.nombre AS factor, af.valor
       FROM alternativa_factor af
       JOIN factores f ON f.id_factor = af.id_factor
      WHERE af.id_alternativa IN (?)
      ORDER BY f.id_factor`,
    [alts.map((a) => a.id_alternativa)]
  );
  return alts.map((a) => ({
    ...a,
    factores: valores
      .filter((v) => v.id_alternativa === a.id_alternativa)
      .map(({ id_factor, factor, valor }) => ({ id_factor, factor, valor })),
  }));
}

async function obtenerDetalle(id, idUsuario) {
  const sit = await obtenerPropia(id, idUsuario);
  const [[categoria]] = await pool.query(
    'SELECT nombre FROM categorias WHERE id_categoria = ?', [sit.id_categoria]
  );
  const [factores] = await pool.query(
    `SELECT sf.id_factor, f.nombre, f.descripcion, sf.valor
       FROM situacion_factor sf JOIN factores f ON f.id_factor = sf.id_factor
      WHERE sf.id_situacion = ? ORDER BY f.id_factor`, [id]
  );
  const alternativas = await alternativasConValores(id);
  const [escenarios] = await pool.query(
    'SELECT * FROM escenarios WHERE id_situacion = ? ORDER BY id_escenario', [id]
  );
  const [checklist] = await pool.query(
    'SELECT * FROM checklist WHERE id_situacion = ? ORDER BY id_checklist', [id]
  );
  const [analisis] = await pool.query(
    `SELECT * FROM analisis WHERE id_situacion = ?
      ORDER BY fecha_analisis DESC, id_analisis DESC LIMIT 1`, [id]
  );
  return {
    ...sit,
    categoria: categoria.nombre,
    factores,
    alternativas,
    escenarios: escenarios.map((e) => ({ ...e, variables: parseJson(e.variables), resultado: parseJson(e.resultado) })),
    checklist: checklist.map((i) => ({ ...i, completado: !!i.completado })),
    ultimo_analisis: analisis[0] || null,
  };
}

async function crear(idUsuario, datos) {
  const id_categoria = entero(datos.id_categoria, 'id_categoria');
  const titulo = textoRequerido(datos.titulo, 'titulo', 150);
  const descripcion = textoOpcional(datos.descripcion);
  const [r] = await pool.query(
    'INSERT INTO situaciones (id_usuario, id_categoria, titulo, descripcion) VALUES (?, ?, ?, ?)',
    [idUsuario, id_categoria, titulo, descripcion]
  );
  await registrarHistorial(idUsuario, r.insertId, 'creada');
  return obtenerPropia(r.insertId, idUsuario);
}

async function actualizar(id, idUsuario, datos) {
  const actual = await obtenerPropia(id, idUsuario);
  const titulo = datos.titulo !== undefined ? textoRequerido(datos.titulo, 'titulo', 150) : actual.titulo;
  const descripcion = datos.descripcion !== undefined ? textoOpcional(datos.descripcion) : actual.descripcion;
  const id_categoria = datos.id_categoria !== undefined ? entero(datos.id_categoria, 'id_categoria') : actual.id_categoria;
  const estado = datos.estado !== undefined ? datos.estado : actual.estado;
  if (!ESTADOS.includes(estado)) throw new HttpError(400, 'estado inválido');
  await pool.query(
    'UPDATE situaciones SET titulo = ?, descripcion = ?, id_categoria = ?, estado = ? WHERE id_situacion = ?',
    [titulo, descripcion, id_categoria, estado, id]
  );
  return obtenerPropia(id, idUsuario);
}

async function eliminar(id, idUsuario) {
  await obtenerPropia(id, idUsuario);
  await pool.query('DELETE FROM situaciones WHERE id_situacion = ?', [id]);
}

// Reemplaza todos los valores de factores de la situación (en una transacción).
async function guardarFactores(id, idUsuario, factores) {
  await obtenerPropia(id, idUsuario);
  if (!Array.isArray(factores)) throw new HttpError(400, 'factores debe ser una lista');
  const filas = factores
    .filter((f) => f && String(f.valor ?? '').trim() !== '')
    .map((f) => [id, entero(f.id_factor, 'id_factor'), String(f.valor).trim().slice(0, 255)]);

  await conTransaccion(async (conn) => {
    await conn.query('DELETE FROM situacion_factor WHERE id_situacion = ?', [id]);
    if (filas.length) {
      await conn.query('INSERT INTO situacion_factor (id_situacion, id_factor, valor) VALUES ?', [filas]);
    }
  });
  const [rows] = await pool.query(
    `SELECT sf.id_factor, f.nombre, sf.valor
       FROM situacion_factor sf JOIN factores f ON f.id_factor = sf.id_factor
      WHERE sf.id_situacion = ? ORDER BY f.id_factor`, [id]
  );
  return rows;
}

// Calcula el progreso según los ítems del checklist completados.
async function recalcularProgreso(idSituacion) {
  const [[r]] = await pool.query(
    'SELECT COUNT(*) AS total, COALESCE(SUM(completado), 0) AS hechos FROM checklist WHERE id_situacion = ?',
    [idSituacion]
  );
  if (!Number(r.total)) return;
  const progreso = Math.round((Number(r.hechos) / Number(r.total)) * 100);
  const estado = progreso === 100 ? 'completado' : progreso > 0 ? 'en_progreso' : 'pendiente';
  await pool.query(
    'UPDATE situaciones SET progreso = ?, estado = ? WHERE id_situacion = ?',
    [progreso, estado, idSituacion]
  );
}

// Datos listos para el "panel de resultados" del frontend.
async function resumen(id, idUsuario) {
  const d = await obtenerDetalle(id, idUsuario);
  const [[tot]] = await pool.query(
    'SELECT COUNT(*) AS total FROM factores WHERE id_categoria = ?', [d.id_categoria]
  );
  return {
    id_situacion: d.id_situacion,
    titulo: d.titulo,
    categoria: d.categoria,
    estado: d.estado,
    progreso: d.progreso,
    factores: { completados: d.factores.length, total: Number(tot.total) },
    alternativas: d.alternativas.length,
    escenarios: d.escenarios.length,
    checklist: { completados: d.checklist.filter((i) => i.completado).length, total: d.checklist.length },
    ultimo_analisis: d.ultimo_analisis
      ? { fecha: d.ultimo_analisis.fecha_analisis, informacion_faltante: d.ultimo_analisis.informacion_faltante }
      : null,
  };
}

async function preguntas(id, idUsuario) {
  const d = await obtenerPropia(id, idUsuario);
  const [[cat]] = await pool.query('SELECT nombre FROM categorias WHERE id_categoria = ?', [d.id_categoria]);
  return (plantillas[cat.nombre] || { preguntas: [] }).preguntas;
}

module.exports = {
  obtenerPropia, listar, alternativasConValores, obtenerDetalle, crear, actualizar,
  eliminar, guardarFactores, recalcularProgreso, resumen, preguntas,
};
