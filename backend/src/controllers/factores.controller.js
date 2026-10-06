const asyncHandler = require('../utils/asyncHandler');
const { entero } = require('../utils/validar');
const service = require('../services/factores.service');

exports.listar = asyncHandler(async (req, res) => res.json(await service.listar(req.query.categoria)));
exports.obtener = asyncHandler(async (req, res) => res.json(await service.obtenerPorId(entero(req.params.id))));
exports.crear = asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body)));
exports.actualizar = asyncHandler(async (req, res) =>
  res.json(await service.actualizar(entero(req.params.id), req.body)));
exports.eliminar = asyncHandler(async (req, res) => {
  await service.eliminar(entero(req.params.id));
  res.status(204).end();
});
