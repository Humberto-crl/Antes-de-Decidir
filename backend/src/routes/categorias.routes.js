const { Router } = require('express');
const c = require('../controllers/categorias.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();
router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', requireAuth, c.crear);
router.put('/:id', requireAuth, c.actualizar);
router.delete('/:id', requireAuth, c.eliminar);
module.exports = router;
