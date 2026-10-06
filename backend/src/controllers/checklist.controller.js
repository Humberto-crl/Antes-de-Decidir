const asyncHandler = require('../utils/asyncHandler');
const { entero } = require('../utils/validar');
const service = require('../services/checklist.service');

const sit = (req) => entero(req.params.id, 'id de situación');
const item = (req) => entero(req.params.idItem, 'id de ítem');

exports.listar = asyncHandler(async (req, res) => res.json(await service.listar(sit(req), req.usuario.id)));
exports.crear = asyncHandler(async (req, res) =>
  res.status(201).json(await service.crear(sit(req), req.usuario.id, req.body)));
exports.generar = asyncHandler(async (req, res) => res.json(await service.generar(sit(req), req.usuario.id)));
exports.actualizar = asyncHandler(async (req, res) =>
  res.json(await service.actualizar(sit(req), item(req), req.usuario.id, req.body)));
exports.eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(sit(req), item(req), req.usuario.id);
  res.status(204).end();
});
