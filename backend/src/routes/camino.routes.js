const { Router } = require('express');
const c = require('../controllers/camino.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();
router.get('/mi-camino', requireAuth, c.miCamino);
router.get('/historial', requireAuth, c.historial);
module.exports = router;
