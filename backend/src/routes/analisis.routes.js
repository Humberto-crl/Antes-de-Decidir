const { Router } = require('express');
const c = require('../controllers/analisis.controller');

const router = Router({ mergeParams: true });
router.get('/', c.listar);
router.post('/', c.generar);
module.exports = router;
