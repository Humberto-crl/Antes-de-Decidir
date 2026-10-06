const asyncHandler = require('../utils/asyncHandler');
const { entero } = require('../utils/validar');
const service = require('../services/situaciones.service');

const ids = (req) => ({ id: entero(req.params.id), u: req.usuario.id });

exports.listar = asyncHandler(async (req, res) =>
  res.json(await service.listar(req.usuario.id, req.query)));
exports.obtener = asyncHandler(async (req, res) => {
  const { id, u } = ids(req);
  res.json(await service.obtenerDetalle(id, u));
});
exports.crear = asyncHandler(async (req, res) =>
  res.status(201).json(await service.crear(req.usuario.id, req.body)));
exports.actualizar = asyncHandler(async (req, res) => {
  const { id, u } = ids(req);
  res.json(await service.actualizar(id, u, req.body));
});
exports.eliminar = asyncHandler(async (req, res) => {
  const { id, u } = ids(req);
  await service.eliminar(id, u);
  res.status(204).end();
});
exports.guardarFactores = asyncHandler(async (req, res) => {
  const { id, u } = ids(req);
  res.json(await service.guardarFactores(id, u, req.body.factores));
});
exports.resumen = asyncHandler(async (req, res) => {
  const { id, u } = ids(req);
  res.json(await service.resumen(id, u));
});
exports.preguntas = asyncHandler(async (req, res) => {
  const { id, u } = ids(req);
  res.json(await service.preguntas(id, u));
});
