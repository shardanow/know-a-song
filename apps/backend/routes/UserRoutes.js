const Router = require('express');
const router = new Router();
const userController = require('../controller/UserController');

router.post('/user', userController.createUser);
router.get('/user/:id', userController.getUserByID);
router.get('/user/:username', userController.getUserByUsername);
router.post('/users', userController.getUsers);
router.put('/user/:id', userController.updateUser);
router.put('/user/type/:id', userController.updateUserType);
router.delete('/user/:id', userController.deleteUser);

module.exports = router;