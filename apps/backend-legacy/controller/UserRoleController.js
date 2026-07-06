const db = require('../db');

class UserRoleController {
    async createUserRole(request, response){
        const {title, rights} = request.body;
        const newUserRole = await db.query(
            'INSERT INTO UserType(title, rights) VALUES ($1, $2) RETURNING *'
            , [title, rights]);

        console.info(newUserRole);
        response.json(newUserRole);
    }

    async getUserRolesList(request, response){
        const getUserRoles = await db.query(
            'SELECT * FROM UserType');

        console.info(getUserRoles);
        response.json(getUserRoles);
    }

    async getUserRole(request, response){
        const {id} = request.params;
        const getRole = await db.query(
            'SELECT * FROM UserType WHERE id = $1'
            , [id]);

        console.info(getRole);
        response.json(getRole);
    }

    async updateUserRole(request, response){
        const {title, rights} = request.body;
        const {id} = request.params;
        const updateRole = await db.query(
            'UPDATE UserType set title = $2, rights = $3 WHERE id = $1 RETURNING *'
            , [id, title, rights]);

        console.info(updateRole);
        response.json(updateRole);
    }

    async deleteUserRole(request, response){
        const {id} = request.params;
        const deleteRole = await db.query(
            'DELETE FROM UserType WHERE id = $1 RETURNING *'
            , [id]);

        console.info(deleteRole);
        response.json(deleteRole);
    }

}

module.exports = new UserRoleController();