const db = require('../db');
const generators = require('../helpers/generators');
const authorization = require('../controller/AuthorizationController');
require('dotenv').config();

class UserController{
    async createUser(request, response){
        let {username, password, token} = request.body;
        // Encrypt Password
        password = generators.encryptStringData(password);

        //Get checking of API method caller have requested rights
        const rights = await authorization.checkUserRights(token, ['authorization', 'add_users', 'edit_users']);
        //Generate new token
        const tokenNew = generators.randomTokenKey();

        //Create User if API method caller have according rights
        if(rights.token !== 0){
            try {
                const newUser = await db.query(
                    'INSERT INTO Users(username, password, token) VALUES ($1, $2, $3) RETURNING *'
                    , [username, password, tokenNew]);

                return response.json(newUser);
            }
            catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        }
        else{
            return response.status(403).json({message: rights.message});
        }
    }

    async getUsers(request, response){
        let {token} = request.body;

        //Get checking of API method caller have requested rights
        const rights = authorization.checkUserRights(token, ['authorization', 'edit_users']);

        //Get Users if API method caller have admin rights
        if((await rights).token !== 0){
            try{
                const getUsers = await db.query(
                    'SELECT Users.username, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id');

                return response.json(getUsers);
            }
            catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        }
        else{
            return response.status(403).json({message: (await rights).message});
        }
    }

    async getUserByID(request, response){
        const {id} = request.params;

        try{
            const getUser = await db.query(
                'SELECT Users.username, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.id = $1'
                , [id]);

            if(getUser.length > 0){
                response.json(getUser);
            }
            else{
                return response.status(403).json({message: 'No user found with ID = '+id});
            }
        }
        catch (e) {
            //Send 409 response with error data
            return response.status(409).json({message: e.detail});
        }
    }

    async getUserByUsername(request, response){
        const {username} = request.params;

        try{
            const getUser = await db.query(
                'SELECT Users.username, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.username = $1'
                , [username]);

            if(getUser.length > 0){
                return response.json(getUser);
            }
            else{
                return response.status(403).json({message: 'No user found with Username = '+username});
            }
        }
        catch (e) {
            //Send 409 response with error data
            return response.status(409).json({message: e.detail});
        }
    }

    async updateUser(request, response){
        let {username, password, user_type_id, token} = request.body;
        const {id} = request.params;

        // Encrypt Password
        password = generators.encryptStringData(password);
        //Generate Token
        const newToken = generators.randomTokenKey();

        //Get checking of API method caller have requested rights
        const rights = await authorization.checkUserRights(token, ['authorization', 'edit_users']);

        //Update User if API method caller have requested rights
        if(rights.token !== 0){
            try{
                //Update User with passed id and token (without changing user_type_id)
                let updateUser = await db.query(
                    'UPDATE Users set username = $3, password = $4, token = $5 WHERE id = $1 AND token = $2 RETURNING *'
                    , [id, token, username, password, newToken]);

                //Update any user by passed id if requested user have admin rights (with changing user_type_id)
                if (rights.role.toLowerCase() === 'admin') {
                    updateUser = await db.query(
                        'UPDATE Users set username = $2, password = $3, token = $4, user_type_id = $5 WHERE id = $1 RETURNING *'
                        , [id, username, password, newToken, user_type_id]);
                }

                if (updateUser.length > 0) {
                    return response.json(updateUser);
                } else {
                    return response.status(403).json({message: 'User does not exist for passed data'});
                }
            }
            catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        }
        else{
            return response.status(403).json({message: (await rights).message});
        }

    }

    async updateUserType(request, response){
        let {user_type_id, token} = request.body;
        const {id} = request.params;

        //Generate Token
        const newToken = generators.randomTokenKey();

        //Get checking of API method caller have requested rights
        const rights = await authorization.checkUserRights(token, ['authorization', 'add_users', 'edit_users']);

        //Update Users Type if API method caller have admin rights
        if(rights.token !== 0 && rights.role.toLowerCase() === 'admin'){
            try{
                const updateUser = await db.query(
                    'UPDATE Users set user_type_id = $2, token = $3 WHERE id = $1 RETURNING *'
                    , [id, user_type_id, newToken]);

                response.json(updateUser);
            }
            catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        }
        else{
            return response.status(403).json({message: rights.message});
        }

    }

    async deleteUser(request, response){
        let {token} = request.body;
        const {id} = request.params;

        //Get checking of API method caller have requested rights
        const rights = await authorization.checkUserRights(token, ['authorization', 'edit_users']);

        //Get Users if API method caller have requested rights
        if(rights.token !== 0) {
            try {
                //Delete User with passed id and token
                let deleteUser = await db.query(
                    'DELETE FROM Users WHERE id = $1 AND token = $2 RETURNING *'
                    , [id, token]);

                //Delete any user by passed id if requested user have admin rights
                if(rights.role.toLowerCase() === 'admin')
                {
                    deleteUser = await db.query(
                        'DELETE FROM Users WHERE id = $1 RETURNING *'
                        , [id]);
                }

                if (deleteUser.length > 0) {
                    response.json(deleteUser);
                } else {
                    return response.status(403).json({message: 'User does not exist for passed data'});
                }
            } catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        }
        else{
            return response.status(403).json({message: rights.message});
        }
    }

}

module.exports = new UserController();