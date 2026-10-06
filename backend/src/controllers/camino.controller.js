const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/camino.service');

exports.miCamino = asyncHandler(async (req, res) => res.json(await service.miCamino(req.usuario.id)));
exports.historial = asyncHandler(async (req, res) => res.json(await service.historial(req.usuario.id)));
