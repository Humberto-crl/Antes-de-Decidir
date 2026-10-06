const { Router } = require('express');
const c = require('../controllers/ia.controller');

const router = Router({ mergeParams: true });
router.post('/', c.interpretar);
module.exports = router;
