const { Router } = require('express');
const controller = require('../controllers/categorias.controller');

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);

module.exports = router;