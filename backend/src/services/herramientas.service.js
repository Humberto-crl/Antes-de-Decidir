// Calculadoras y comparador. No usan base de datos: reciben números y devuelven resultados.
const HttpError = require('../utils/httpError');
const { numero, textoRequerido } = require('../utils/validar');

const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => `Q${r2(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------- Salario real ----------
function calcularSalarioNeto(d = {}) {
  const salario = numero(d.salario, 'salario');
  const descuentosPct = numero(d.descuentos_pct, 'descuentos_pct', { max: 100, defecto: 0 });
  const transporte = numero(d.transporte, 'transporte', { defecto: 0 });
  const otros = numero(d.otros_gastos, 'otros_gastos', { defecto: 0 });
  const horasTrabajo = numero(d.horas_trabajo, 'horas_trabajo', { max: 24, defecto: 8 });
  const horasTraslado = numero(d.horas_traslado, 'horas_traslado', { max: 24, defecto: 0 });
  const diasMes = numero(d.dias_mes, 'dias_mes', { min: 1, max: 31, defecto: 22 });

  const descuentos = salario * (descuentosPct / 100);
  const neto = salario - descuentos - transporte - otros;
  const horasDia = horasTrabajo + horasTraslado;
  const horasMes = horasDia * diasMes;

  return {
    salario_bruto: r2(salario),
    descuentos: r2(descuentos),
    transporte: r2(transporte),
    otros_gastos: r2(otros),
    ingreso_neto: r2(neto),
    horas_dia: r2(horasDia),
    horas_mes: r2(horasMes),
    ingreso_por_hora: horasMes > 0 ? r2(neto / horasMes) : 0,
  };
}

// ---------- Comparador de alternativas (ej. dos ofertas de trabajo) ----------
function comparar(d = {}) {
  const lista = d.alternativas;
  if (!Array.isArray(lista) || lista.length < 2 || lista.length > 5) {
    throw new HttpError(400, 'Envía entre 2 y 5 alternativas para comparar');
  }
  const resultados = lista.map((a, i) => {
    const nombre = textoRequerido(a.nombre, `alternativas[${i}].nombre`, 100);
    const calculo = calcularSalarioNeto(a);
    return {
      nombre,
      ...calculo,
      permite_estudiar: typeof a.permite_estudiar === 'boolean' ? a.permite_estudiar : null,
      experiencia: ['baja', 'media', 'alta'].includes(a.experiencia) ? a.experiencia : null,
    };
  });

  const mayor = (campo) => resultados.reduce((m, x) => (x[campo] > m[campo] ? x : m));
  const menor = (campo) => resultados.reduce((m, x) => (x[campo] < m[campo] ? x : m));
  const masSalario = mayor('salario_bruto');
  const masNeto = mayor('ingreso_neto');
  const mejorHora = mayor('ingreso_por_hora');
  const menosTiempo = menor('horas_dia');

  const observaciones = [];
  if (masSalario.nombre !== masNeto.nombre) {
    observaciones.push(
      `"${masSalario.nombre}" ofrece el mayor salario, pero "${masNeto.nombre}" te deja más dinero al mes ` +
      `(${fmt(masNeto.ingreso_neto)} vs ${fmt(masSalario.ingreso_neto)}) después de descuentos y gastos.`
    );
  } else {
    observaciones.push(`"${masNeto.nombre}" tiene el mayor salario y también te deja más dinero al mes.`);
  }
  if (mejorHora.nombre !== masNeto.nombre) {
    observaciones.push(
      `Si cuentas el tiempo invertido, "${mejorHora.nombre}" rinde más por hora (${fmt(mejorHora.ingreso_por_hora)}/h).`
    );
  }
  if (menosTiempo.horas_dia !== mayor('horas_dia').horas_dia) {
    observaciones.push(`"${menosTiempo.nombre}" es la que menos tiempo diario consume (${menosTiempo.horas_dia} h).`);
  }
  const noEstudia = resultados.filter((r) => r.permite_estudiar === false).map((r) => r.nombre);
  if (noEstudia.length) {
    observaciones.push(`Estas alternativas no permiten seguir estudiando: ${noEstudia.join(', ')}.`);
  }
  observaciones.push('Esta comparación no decide por ti: la mejor opción depende de tus prioridades.');

  return {
    alternativas: resultados,
    destacados: {
      mayor_salario_bruto: masSalario.nombre,
      mayor_ingreso_neto: masNeto.nombre,
      mejor_ingreso_por_hora: mejorHora.nombre,
      menos_tiempo_diario: menosTiempo.nombre,
    },
    observaciones,
  };
}

// ---------- Presupuesto (regla 50/30/20 como referencia) ----------
function presupuesto(d = {}) {
  const ingresos = numero(d.ingresos, 'ingresos', { min: 0.01 });
  if (!Array.isArray(d.gastos) || d.gastos.length === 0) {
    throw new HttpError(400, 'Envía al menos un gasto');
  }
  const tipos = { necesidad: 0, deseo: 0, ahorro: 0 };
  d.gastos.forEach((g, i) => {
    const monto = numero(g.monto, `gastos[${i}].monto`);
    const tipo = g.tipo === undefined ? 'necesidad' : g.tipo;
    if (!(tipo in tipos)) throw new HttpError(400, `gastos[${i}].tipo debe ser necesidad, deseo o ahorro`);
    tipos[tipo] += monto;
  });
  const totalGastos = tipos.necesidad + tipos.deseo + tipos.ahorro;
  const saldo = ingresos - totalGastos;
  const ahorroTotal = tipos.ahorro + Math.max(saldo, 0);
  const pct = (n) => r2((n / ingresos) * 100);

  const observaciones = [];
  if (saldo < 0) observaciones.push(`Tus gastos superan tus ingresos por ${fmt(-saldo)} al mes.`);
  if (pct(tipos.necesidad) > 50) observaciones.push(`Tus necesidades usan ${pct(tipos.necesidad)}% del ingreso (referencia: 50%).`);
  if (pct(tipos.deseo) > 30) observaciones.push(`Tus deseos usan ${pct(tipos.deseo)}% del ingreso (referencia: 30%).`);
  if (pct(ahorroTotal) < 20) observaciones.push(`Estás ahorrando ${pct(ahorroTotal)}% del ingreso (referencia: 20%).`);
  if (observaciones.length === 0) observaciones.push('Tu presupuesto está dentro de la referencia 50/30/20.');

  return {
    ingresos: r2(ingresos),
    total_gastos: r2(totalGastos),
    saldo: r2(saldo),
    porcentajes: { necesidades: pct(tipos.necesidad), deseos: pct(tipos.deseo), ahorro: pct(ahorroTotal) },
    referencia: { necesidades: 50, deseos: 30, ahorro: 20 },
    observaciones,
  };
}

// ---------- Meta de ahorro ----------
function ahorro(d = {}) {
  const meta = numero(d.meta, 'meta', { min: 0.01 });
  const actual = numero(d.ahorro_actual, 'ahorro_actual', { defecto: 0 });
  const mensual = numero(d.ahorro_mensual, 'ahorro_mensual', { min: 0.01 });
  const faltante = Math.max(meta - actual, 0);
  const meses = Math.ceil(faltante / mensual);
  return {
    meta: r2(meta),
    ahorro_actual: r2(actual),
    faltante: r2(faltante),
    meses_necesarios: meses,
    interpretacion: faltante === 0
      ? 'Ya alcanzaste tu meta.'
      : `Ahorrando ${fmt(mensual)} al mes, alcanzarías tu meta en ${meses} mes(es).`,
  };
}

// ---------- Escenarios: "¿qué pasa si cambia algo?" ----------
function calcularEscenario(base = {}, cambios = {}) {
  const ingresos = numero(base.ingresos, 'base.ingresos');
  const gastos = numero(base.gastos, 'base.gastos');
  const ingresosPct = numero(cambios.ingresos_pct, 'ingresos_pct', { min: -100, max: 1000, defecto: 0 });
  const gastosPct = numero(cambios.gastos_pct, 'gastos_pct', { min: -100, max: 1000, defecto: 0 });
  const ingresosExtra = numero(cambios.ingresos_extra, 'ingresos_extra', { min: -1e9, defecto: 0 });
  const gastosExtra = numero(cambios.gastos_extra, 'gastos_extra', { min: -1e9, defecto: 0 });

  const nuevosIngresos = ingresos * (1 + ingresosPct / 100) + ingresosExtra;
  const nuevosGastos = gastos * (1 + gastosPct / 100) + gastosExtra;
  const saldoBase = ingresos - gastos;
  const saldoNuevo = nuevosIngresos - nuevosGastos;
  const diferencia = saldoNuevo - saldoBase;

  return {
    base: { ingresos: r2(ingresos), gastos: r2(gastos), saldo: r2(saldoBase) },
    nuevo: { ingresos: r2(nuevosIngresos), gastos: r2(nuevosGastos), saldo: r2(saldoNuevo) },
    diferencia_saldo: r2(diferencia),
    interpretacion: diferencia === 0
      ? 'Este escenario no cambia tu saldo mensual.'
      : `Este escenario ${diferencia > 0 ? 'aumenta' : 'reduce'} tu saldo mensual en ${fmt(Math.abs(diferencia))}.` +
        (saldoNuevo < 0 ? ' Ojo: el saldo quedaría negativo.' : ''),
  };
}

function simularEscenarios(d = {}) {
  if (!Array.isArray(d.escenarios) || d.escenarios.length === 0) {
    throw new HttpError(400, 'Envía al menos un escenario');
  }
  return d.escenarios.map((e, i) => ({
    nombre: textoRequerido(e.nombre, `escenarios[${i}].nombre`, 100),
    ...calcularEscenario(d.base, e.cambios),
  }));
}

module.exports = { calcularSalarioNeto, comparar, presupuesto, ahorro, calcularEscenario, simularEscenarios };
