const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/herramientas.service');

exports.salarioNeto = asyncHandler(async (req, res) => res.json(service.calcularSalarioNeto(req.body)));
exports.comparar = asyncHandler(async (req, res) => res.json(service.comparar(req.body)));
exports.presupuesto = asyncHandler(async (req, res) => res.json(service.presupuesto(req.body)));
exports.ahorro = asyncHandler(async (req, res) => res.json(service.ahorro(req.body)));
exports.escenarios = asyncHandler(async (req, res) => res.json(service.simularEscenarios(req.body)));
