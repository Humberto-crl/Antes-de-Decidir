const { Router } = require('express');
const c = require('../controllers/checklist.controller');

const router = Router({ mergeParams: true });
router.get('/', c.listar);
router.post('/generar', c.generar);
router.post('/', c.crear);
router.put('/:idItem', c.actualizar);
router.delete('/:idItem', c.eliminar);
module.exports = router;
