const { Router } = require('express');
const c = require('../controllers/escenarios.controller');

const router = Router({ mergeParams: true });
router.get('/', c.listar);
router.post('/', c.crear);
router.delete('/:idEsc', c.eliminar);
module.exports = router;
