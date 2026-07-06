const Router = require('express');
const router = new Router();
const authorizationController = require('../controller/AuthorizationController');
const validate = require('../middleware/validate');
const { authorizeSchema } = require('../validation/schemas');

router.post('/authorize', validate(authorizeSchema), authorizationController.authorizeUser);
router.post('/activate', authorizationController.activateUser);

module.exports = router;
