const Router = require('express');
const router = new Router();
const userController = require('../controller/UserController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUserSchema } = require('../validation/schemas');

router.post('/user', validate(createUserSchema), userController.createUser);
router.get('/user/id/:id', userController.getUserByID);
router.get('/user/username/:username', userController.getUserByUsername);
router.post('/users', authMiddleware, userController.getUsers);
router.put('/user/:id', authMiddleware, userController.updateUser);
router.put('/user/type/:id', authMiddleware, userController.updateUserType);
router.delete('/user/:id', authMiddleware, userController.deleteUser);
router.post('/is_active_user', userController.isActiveUser);

module.exports = router;
