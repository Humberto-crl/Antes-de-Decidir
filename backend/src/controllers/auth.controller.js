const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/auth.service');

exports.registro = asyncHandler(async (req, res) => {
  res.status(201).json(await service.registrar(req.body));
});
exports.login = asyncHandler(async (req, res) => {
  res.json(await service.login(req.body));
});
exports.perfil = asyncHandler(async (req, res) => {
  res.json(await service.perfil(req.usuario.id));
});
