const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { textoRequerido, textoOpcional, parseJson } = require('../utils/validar');
const situaciones = require('./situaciones.service');
const herramientas = require('./herramientas.service');

const formatear = (e) => ({ ...e, variables: parseJson(e.variables), resultado: parseJson(e.resultado) });

async function listar(idSituacion, idUsuario) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const [rows] = await pool.query(
    'SELECT * FROM escenarios WHERE id_situacion = ? ORDER BY id_escenario', [idSituacion]
  );
  return rows.map(formatear);
}

// Body: { nombre, descripcion, base: {ingresos, gastos}, cambios: {ingresos_pct, gastos_pct, ...} }
async function crear(idSituacion, idUsuario, datos) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const nombre = textoRequerido(datos.nombre, 'nombre', 100);
  const descripcion = textoOpcional(datos.descripcion);
  const cambios = datos.cambios || {};
  const resultado = herramientas.calcularEscenario(datos.base, cambios);
  const variables = { base: datos.base, cambios };

  const [r] = await pool.query(
    'INSERT INTO escenarios (id_situacion, nombre, descripcion, variables, resultado) VALUES (?, ?, ?, ?, ?)',
    [idSituacion, nombre, descripcion, JSON.stringify(variables), JSON.stringify(resultado)]
  );
  return { id_escenario: r.insertId, id_situacion: idSituacion, nombre, descripcion, variables, resultado };
}

async function eliminar(idSituacion, idEscenario, idUsuario) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const [r] = await pool.query(
    'DELETE FROM escenarios WHERE id_escenario = ? AND id_situacion = ?', [idEscenario, idSituacion]
  );
  if (r.affectedRows === 0) throw new HttpError(404, 'Escenario no encontrado');
}

module.exports = { listar, crear, eliminar };
