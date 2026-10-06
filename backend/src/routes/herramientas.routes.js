const { Router } = require('express');
const c = require('../controllers/herramientas.controller');

const router = Router();
router.post('/salario-neto', c.salarioNeto);
router.post('/comparar', c.comparar);
router.post('/presupuesto', c.presupuesto);
router.post('/ahorro', c.ahorro);
router.post('/escenarios', c.escenarios);
module.exports = router;
