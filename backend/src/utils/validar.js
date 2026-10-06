const HttpError = require('./httpError');

const vacio = (v) => v === undefined || v === null || v === '';

function entero(valor, nombre = 'id') {
  const n = Number(valor);
  if (vacio(valor) || !Number.isInteger(n) || n < 1) {
    throw new HttpError(400, `${nombre} inválido`);
  }
  return n;
}

function textoRequerido(valor, nombre, max = 255) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new HttpError(400, `${nombre} es obligatorio`);
  }
  const t = valor.trim();
  if (t.length > max) {
    throw new HttpError(400, `${nombre} no puede superar ${max} caracteres`);
  }
  return t;
}

function textoOpcional(valor, max = 65000) {
  if (vacio(valor)) return null;
  if (typeof valor !== 'string') throw new HttpError(400, 'Se esperaba un texto');
  const t = valor.trim();
  if (t.length > max) throw new HttpError(400, `El texto no puede superar ${max} caracteres`);
  return t || null;
}

function numero(valor, nombre, { min = 0, max = 1e12, defecto } = {}) {
  if (vacio(valor)) {
    if (defecto !== undefined) return defecto;
    throw new HttpError(400, `${nombre} es obligatorio`);
  }
  const n = Number(valor);
  if (typeof valor === 'boolean' || !Number.isFinite(n) || n < min || n > max) {
    throw new HttpError(400, `${nombre} debe ser un número entre ${min} y ${max}`);
  }
  return n;
}

// Los campos JSON pueden llegar como objeto o como texto según el motor de MySQL.
function parseJson(valor) {
  if (typeof valor === 'string') {
    try { return JSON.parse(valor); } catch { return valor; }
  }
  return valor;
}

module.exports = { entero, textoRequerido, textoOpcional, numero, parseJson };
