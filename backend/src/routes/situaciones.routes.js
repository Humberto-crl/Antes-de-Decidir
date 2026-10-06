const { Router } = require('express');
const c = require('../controllers/situaciones.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();
router.use(requireAuth); // todo en /api/situaciones exige sesión iniciada

router.get('/', c.listar);
router.post('/', c.crear);
router.get('/:id', c.obtener);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

router.put('/:id/factores', c.guardarFactores);
router.get('/:id/resumen', c.resumen);
router.get('/:id/preguntas', c.preguntas);

router.use('/:id/alternativas', require('./alternativas.routes'));
router.use('/:id/analisis', require('./analisis.routes'));
router.use('/:id/checklist', require('./checklist.routes'));
router.use('/:id/escenarios', require('./escenarios.routes'));
router.use('/:id/ia', require('./ia.routes'));

module.exports = router;
