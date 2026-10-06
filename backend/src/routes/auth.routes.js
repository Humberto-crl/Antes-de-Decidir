const { Router } = require('express');
const c = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();
router.post('/registro', c.registro);
router.post('/login', c.login);
router.get('/perfil', requireAuth, c.perfil);
module.exports = router;
