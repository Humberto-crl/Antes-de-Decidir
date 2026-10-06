const asyncHandler = require('../utils/asyncHandler');
const { entero } = require('../utils/validar');
const service = require('../services/escenarios.service');

const sit = (req) => entero(req.params.id, 'id de situación');

exports.listar = asyncHandler(async (req, res) => res.json(await service.listar(sit(req), req.usuario.id)));
exports.crear = asyncHandler(async (req, res) =>
  res.status(201).json(await service.crear(sit(req), req.usuario.id, req.body)));
exports.eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(sit(req), entero(req.params.idEsc, 'id de escenario'), req.usuario.id);
  res.status(204).end();
});
