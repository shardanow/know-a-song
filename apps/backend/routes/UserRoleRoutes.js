const Router = require('express');
const router = new Router();
const userRoleController = require('../controller/UserRoleController');

router.post('/user_role', userRoleController.createUserRole);
router.get('/user_role/:id', userRoleController.getUserRole);
router.get('/user_roles', userRoleController.getUserRolesList);
router.put('/user_role/:id', userRoleController.updateUserRole);
router.delete('/user_role/:id', userRoleController.deleteUserRole);

module.exports = router;