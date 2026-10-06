const asyncHandler = require('../utils/asyncHandler');
const { entero } = require('../utils/validar');
const service = require('../services/analisis.service');

const sit = (req) => entero(req.params.id, 'id de situación');

exports.generar = asyncHandler(async (req, res) => res.status(201).json(await service.generar(sit(req), req.usuario.id)));
exports.listar = asyncHandler(async (req, res) => res.json(await service.listar(sit(req), req.usuario.id)));
