const asyncHandler = require('../utils/asyncHandler');
const { entero } = require('../utils/validar');
const service = require('../services/ia.service');

exports.interpretar = asyncHandler(async (req, res) =>
  res.json(await service.interpretar(entero(req.params.id, 'id de situación'), req.usuario.id, req.body)));
