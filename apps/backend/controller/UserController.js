const db = require('../db');
const generators = require('../helpers/generators');
require('dotenv').config();

class UserController {
    createUser = async (request, response) => {
        let {username, password, email} = request.body;
        // Hash Password
        password = await generators.hashPassword(password);

        //Generate new token
        const tokenNew = generators.randomTokenKey();

        try {
            const newUser = await db.query(
                'INSERT INTO Users(username, password, email, token) VALUES ($1, $2, $3, $4) RETURNING *'
                , [username, password, email, tokenNew]);

            return response.json(newUser);
        } catch (e) {
            //Send 409 response with error data
            return response.status(409).json({message: e.detail});
        }
    }

    getUsers = async (request, response) => {
        const rights = this.checkUserRights(request.token, ['authorization', 'edit_users']);

        //Get Users if API method caller have admin rights
        if ((await rights).token !== 0) {
            try {
                const getUsers = await db.query(
                    'SELECT Users.username, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id');

                return response.json(getUsers);
            } catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        } else {
            return response.status(403).json({message: (await rights).message});
        }
    }

    getUserByID = async (request, response) => {
        const {id} = request.params;

        try {
            const getUser = await db.query(
                'SELECT Users.username, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.id = $1'
                , [id]);

            if (getUser.length > 0) {
                response.json(getUser);
            } else {
                return response.status(403).json({message: 'No user found with ID = ' + id});
            }
        } catch (e) {
            //Send 409 response with error data
            return response.status(409).json({message: e.detail});
        }
    }

    getUserByUsername = async (request, response) => {
        const {username} = request.params;

        try {
            const getUser = await db.query(
                'SELECT Users.username, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.username = $1'
                , [username]);

            if (getUser.length > 0) {
                return response.json(getUser);
            } else {
                return response.status(403).json({message: 'No user found with Username = ' + username});
            }
        } catch (e) {
            //Send 409 response with error data
            return response.status(409).json({message: e.detail});
        }
    }

    updateUser = async (request, response) => {
        let {username, password, user_type_id, email} = request.body;
        const {id} = request.params;

        // Hash Password
        password = await generators.hashPassword(password);
        //Generate Token
        const newToken = generators.randomTokenKey();

        //Get checking of API method caller have requested rights
        const rights = await this.checkUserRights(request.token, ['authorization', 'edit_users']);

        //Update User if API method caller have requested rights
        if (rights.token !== 0) {
            try {
                //Update User with passed id and token (without changing user_type_id)
                let updateUser = await db.query(
                    'UPDATE Users set username = $3, password = $4, email = $5, token = $6 WHERE id = $1 AND token = $2 RETURNING *'
                    , [id, request.token, username, password, email, newToken]);

                //Update any user by passed id if requested user have admin rights (with changing user_type_id)
                if (rights.role.toLowerCase() === 'admin') {
                    updateUser = await db.query(
                        'UPDATE Users set username = $2, password = $3, email = $4, token = $5, user_type_id = $6 WHERE id = $1 RETURNING *'
                        , [id, username, password, email, newToken, user_type_id]);
                }

                if (updateUser.length > 0) {
                    return response.json(updateUser);
                } else {
                    return response.status(403).json({message: 'User does not exist for passed data'});
                }
            } catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        } else {
            return response.status(403).json({message: (await rights).message});
        }

    }

    updateUserType = async (request, response) => {
        let {user_type_id} = request.body;
        const {id} = request.params;

        //Generate Token
        const newToken = generators.randomTokenKey();

        //Get checking of API method caller have requested rights
        const rights = await this.checkUserRights(request.token, ['authorization', 'add_users', 'edit_users']);

        //Update Users Type if API method caller have admin rights
        if (rights.token !== 0 && rights.role.toLowerCase() === 'admin') {
            try {
                const updateUser = await db.query(
                    'UPDATE Users set user_type_id = $2, token = $3 WHERE id = $1 RETURNING *'
                    , [id, user_type_id, newToken]);

                response.json(updateUser);
            } catch (e) {
                //Send 409 response with error data
                return response.status(409).json({message: e.detail});
            }
        } else {
            return response.status(403).json({message: rights.message});
        }

    }

    deleteUser = async (request, response) => {
        const {id} = request.params;

        //Get checking of API method caller have requested rights
        const rights = await this.checkUserRights(request.token, ['authorization', 'edit_users']);

        //Get Users if API method caller have requested rights
        if (rights.token !== 0) {
            try {
                //Delete User with passed id and token
                let deleteUser = await db.query(
                    'DELETE FROM Users WHERE id = $1 AND token = $2 RETURNING *'
                    , [id, request.token]);

                //Delete any user by passed id if requested user have admin rights
                if (rights.role.toLowerCase() === 'admin') {
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
        } else {
            return response.status(403).json({message: rights.message});
        }
    }

    isActiveUser = async (request, response) => {
        let {username, id} = request.body;
        const userActivationStatus = await this.checkUserActiveStatus(username, id);

        if (userActivationStatus.is_active) {
            return response.status(200).json({message: userActivationStatus.message, username: username});
        }
        else {
            return response.status(403).json({message: userActivationStatus.message, username: username});
        }
    }

    checkUserExist = async (username = '', id = 0) => {
        try {
            const getUser = await db.query(
                'SELECT Users.username FROM Users WHERE (Users.username = $1 OR Users.id = $2)'
                , [username, id]);

            if (getUser.length > 0) {
                return {message: 'User exist', username: username, id: id, exist: true};
            } else {
                return {message: 'User does not exist for passed data', username: username, id: id, exist: false};
            }
        } catch (e) {
            //Send response with error data
            return {message: e.detail, username: '', id: 0};
        }
    }

    checkUserActiveStatus = async (username = '', id = 0) => {
        try {
            const isUserExist = await this.checkUserExist(username, id);

            if (isUserExist.exist) {
                const getUserStatus = await db.query(
                    'SELECT Users.username FROM Users WHERE (Users.username = $1 OR Users.id = $2) AND user_is_active != 0'
                    , [username, id]);

                if (getUserStatus.length > 0) {
                    return {message: 'User is active', username: username, id: id, is_active: true};
                } else {
                    return {message: 'User is not active', username: username, id: id, is_active: false};
                }
            } else {
                return isUserExist;
            }
        } catch (e) {
            //Send response with error data
            return {message: e.detail, username: '', id: 0};
        }
    }

    checkUserRights = async (token = 0, rights = []) => {
        try {
            const rightsCheckData = await db.query(
                'SELECT UserType.title, UserType.rights FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.token = $1'
                , [token]);

            //Rights Compare logic
            if (rightsCheckData.length > 0) {
                //Reformat (add quotes to keys if not exist) and convert rights string from DB to JSON object
                const rightsFormatted = rightsCheckData[0].rights.replace(/(\w+:)|(\w+ :)/g, function (s) {
                    return '"' + s.substring(0, s.length - 1) + '":';
                });
                const rightsObject = JSON.parse(rightsFormatted);

                let haveRights = false;
                //Go through all passed rights and change value according it
                rights.forEach((item) => {
                    haveRights = rightsObject[item];
                });

                if (haveRights) {
                    return {message: 'You have rights', role: rightsCheckData[0].title, token: token};
                } else {
                    return {
                        message: 'You does not have enough rights to use this method',
                        role: rightsCheckData[0].title,
                        token: 0
                    };
                }
            } else {
                return {message: 'Token is not ok', role: 'None', token: 0};
            }
        } catch (e) {
            //Send response with error data
            console.log(e);
            return {message: e.detail ? e.detail : e};
        }
    }

}

module.exports = new UserController();