const pool = require('../config/db');
const situaciones = require('./situaciones.service');
const { registrarHistorial } = require('./camino.service');

// Convierte "Q4,500" o "4500" en número; si no es un número devuelve null.
function aNumero(valor) {
  const limpio = String(valor ?? '').replace(/[Qq\s,]/g, '');
  return /^-?\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : null;
}

// Motor de análisis: revisa qué se completó, qué falta y en qué difieren las alternativas.
async function generar(idSituacion, idUsuario) {
  const sit = await situaciones.obtenerPropia(idSituacion, idUsuario);

  const [factoresCat] = await pool.query(
    'SELECT id_factor, nombre FROM factores WHERE id_categoria = ? ORDER BY id_factor', [sit.id_categoria]
  );
  const [valores] = await pool.query(
    "SELECT id_factor FROM situacion_factor WHERE id_situacion = ? AND TRIM(valor) <> ''", [idSituacion]
  );
  const conValor = new Set(valores.map((v) => v.id_factor));
  const faltantesCat = factoresCat.filter((f) => !conValor.has(f.id_factor));
  const alternativas = await situaciones.alternativasConValores(idSituacion);
  const [[chk]] = await pool.query(
    'SELECT COUNT(*) AS total, COALESCE(SUM(completado), 0) AS hechos FROM checklist WHERE id_situacion = ?',
    [idSituacion]
  );

  const observaciones = [];
  const faltante = [];

  // 1) Cobertura de factores
  const total = factoresCat.length;
  const cobertura = total ? Math.round(((total - faltantesCat.length) / total) * 100) : 100;
  observaciones.push(`Has completado ${cobertura}% de los factores relevantes para esta categoría.`);
  faltantesCat.forEach((f) => faltante.push(`Falta información sobre: ${f.nombre}`));

  // 2) Descripción
  if (!sit.descripcion || sit.descripcion.length < 30) {
    faltante.push('La descripción es muy breve: agrega contexto (qué pasó, plazos, quiénes participan).');
  }

  // 3) Alternativas
  if (alternativas.length < 2) {
    faltante.push('Agrega al menos 2 alternativas para poder compararlas.');
  } else {
    const porFactor = new Map(); // factor -> [{alt, valor}]
    alternativas.forEach((a) => a.factores.forEach((f) => {
      if (!porFactor.has(f.factor)) porFactor.set(f.factor, []);
      porFactor.get(f.factor).push({ alt: a.nombre, valor: f.valor });
    }));

    porFactor.forEach((items, factor) => {
      // Alternativas que no tienen dato para este factor
      alternativas
        .filter((a) => !items.some((i) => i.alt === a.nombre))
        .forEach((a) => faltante.push(`La alternativa "${a.nombre}" no tiene valor para "${factor}".`));

      // Diferencias numéricas
      const nums = items.map((i) => ({ alt: i.alt, n: aNumero(i.valor) })).filter((i) => i.n !== null);
      if (nums.length >= 2) {
        const min = nums.reduce((m, x) => (x.n < m.n ? x : m));
        const max = nums.reduce((m, x) => (x.n > m.n ? x : m));
        if (min.n !== max.n) {
          observaciones.push(`${factor}: va de ${min.n} ("${min.alt}") a ${max.n} ("${max.alt}").`);
        }
      }
    });
    if (porFactor.size === 0) {
      faltante.push('Tus alternativas no tienen factores: agrega valores (salario, costo, tiempo...) para compararlas.');
    }
  }

  // 4) Checklist
  if (Number(chk.total) === 0) {
    observaciones.push('Aún no tienes checklist: genéralo para saber qué revisar antes de actuar.');
  } else {
    const pendientes = Number(chk.total) - Number(chk.hechos);
    observaciones.push(pendientes === 0
      ? 'Completaste todo tu checklist.'
      : `Te quedan ${pendientes} ítem(s) del checklist por revisar.`);
  }

  const [r] = await pool.query(
    'INSERT INTO analisis (id_situacion, observaciones, informacion_faltante) VALUES (?, ?, ?)',
    [idSituacion, observaciones.join('\n'), faltante.join('\n')]
  );
  await registrarHistorial(idUsuario, idSituacion, 'analizada');

  return {
    id_analisis: r.insertId,
    id_situacion: idSituacion,
    cobertura,
    observaciones,
    informacion_faltante: faltante,
  };
}

async function listar(idSituacion, idUsuario) {
  await situaciones.obtenerPropia(idSituacion, idUsuario);
  const [rows] = await pool.query(
    'SELECT * FROM analisis WHERE id_situacion = ? ORDER BY fecha_analisis DESC, id_analisis DESC',
    [idSituacion]
  );
  return rows.map((a) => ({
    ...a,
    observaciones: a.observaciones ? a.observaciones.split('\n') : [],
    informacion_faltante: a.informacion_faltante ? a.informacion_faltante.split('\n') : [],
  }));
}

module.exports = { generar, listar };
