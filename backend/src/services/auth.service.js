const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { textoRequerido } = require('../utils/validar');

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id_usuario, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

async function registrar(datos) {
  const nombre = textoRequerido(datos.nombre, 'nombre', 100);
  const apellido = textoRequerido(datos.apellido, 'apellido', 100);
  const correo = textoRequerido(datos.correo, 'correo', 150).toLowerCase();
  const password = typeof datos.password === 'string' ? datos.password : '';

  if (!REGEX_CORREO.test(correo)) throw new HttpError(400, 'El correo no es válido');
  if (password.length < 8) throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres');

  // Nunca se guarda la contraseña: solo su "hash" (huella irreversible).
  const hash = await bcrypt.hash(password, 10);

  try {
    const [r] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, correo, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, correo, hash]
    );
    const usuario = { id_usuario: r.insertId, nombre, apellido, correo };
    return { usuario, token: firmarToken(usuario) };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Ese correo ya está registrado');
    throw error;
  }
}

async function login(datos) {
  const correo = String(datos.correo || '').trim().toLowerCase();
  const password = String(datos.password || '');

  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE correo = ? AND estado = TRUE',
    [correo]
  );
  const u = rows[0];
  // Mismo mensaje si falla el correo o la contraseña, para no revelar qué correos existen.
  const valido = u && (await bcrypt.compare(password, u.password));
  if (!valido) throw new HttpError(401, 'Correo o contraseña incorrectos');

  const usuario = {
    id_usuario: u.id_usuario, nombre: u.nombre, apellido: u.apellido, correo: u.correo,
  };
  return { usuario, token: firmarToken(usuario) };
}

async function perfil(idUsuario) {
  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, apellido, correo, fecha_registro FROM usuarios WHERE id_usuario = ?',
    [idUsuario]
  );
  if (!rows[0]) throw new HttpError(404, 'Usuario no encontrado');
  return rows[0];
}

module.exports = { registrar, login, perfil };
