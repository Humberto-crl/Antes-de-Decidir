const jwt = require('jsonwebtoken');
const HttpError = require('../utils/httpError');

// Exige un token en el header:  Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new HttpError(401, 'Debes iniciar sesión');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.id, correo: payload.correo };
    next();
  } catch {
    throw new HttpError(401, 'Sesión inválida o vencida');
  }
}

module.exports = { requireAuth };
