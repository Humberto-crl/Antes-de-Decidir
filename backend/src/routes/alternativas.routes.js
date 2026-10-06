const { Router } = require('express');
const c = require('../controllers/alternativas.controller');

const router = Router({ mergeParams: true }); // mergeParams: permite leer :id de la situación
router.get('/', c.listar);
router.post('/', c.crear);
router.put('/:idAlt', c.actualizar);
router.delete('/:idAlt', c.eliminar);
module.exports = router;
