const asyncHandler = require('../utils/asyncHandler');
const { entero } = require('../utils/validar');
const service = require('../services/alternativas.service');

const sit = (req) => entero(req.params.id, 'id de situación');
const alt = (req) => entero(req.params.idAlt, 'id de alternativa');

exports.listar = asyncHandler(async (req, res) => res.json(await service.listar(sit(req), req.usuario.id)));
exports.crear = asyncHandler(async (req, res) =>
  res.status(201).json(await service.crear(sit(req), req.usuario.id, req.body)));
exports.actualizar = asyncHandler(async (req, res) =>
  res.json(await service.actualizar(sit(req), alt(req), req.usuario.id, req.body)));
exports.eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(sit(req), alt(req), req.usuario.id);
  res.status(204).end();
});
