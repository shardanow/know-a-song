const Router = require('express');
const router = new Router();
const authorizationController = require('../controller/AuthorizationController');

router.post('/authorize', authorizationController.authorizeUser);
router.post('/activate', authorizationController.activateUser);

module.exports = router;