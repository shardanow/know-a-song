const db = require('../db');
const generators = require('../helpers/generators');

class AuthorizationController {
    async authorizeUser(request, response){
        let {username, password} = request.body;

        try {
            const getUser = await db.query(
                'SELECT Users.username, Users.password FROM Users WHERE Users.username = $1'
                , [username]);

            //Authorization logic
            if(getUser.length > 0){
                //Compare user hashed pass to sent one
                if(generators.decryptStringData(getUser[0].password) === password)
                {
                    //Send 200 response with data and Update User Tokenку
                    const newToken = new AuthorizationController;
                    return response.status(200).json({message: 'Authorize was success', token: await newToken.updateUserToken(username).token});
                }
                else{
                    //Send 403 response with data
                    return response.status(403).json({message: 'Authorize was failed', token: 0});
                }
            }
            else{
                //Send 403 response with data
                return response.status(403).json({message: 'User does not exist for passed data', token: 0});
            }
        }
        catch (e) {
            //Send 409 response with error data
            return response.status(409).json({message: e.detail});
        }
    }

    async activateUser(request, response) {
        let {username, id, token} = request.body;

        const activationObject = new AuthorizationController();
        const userActivationStatus = await activationObject.updateUserActiveStatus(username, id, token);

        if(userActivationStatus.token !== 0){
            //Send 200 response with data
            return response.status(200).json({message: userActivationStatus.message, username: username, token: userActivationStatus.token});
        }
        else{
            //Send 403 response with data
            return response.status(403).json({message: userActivationStatus.message, username: username, token: 0});
        }
    }

    async updateUserToken(username = ''){
        try{
            //Generate token
            const token = generators.randomTokenKey();

            //Update User Token to new one
            const userToken = await db.query(
                'UPDATE Users set token = $2 WHERE username = $1 RETURNING *'
                , [username, token]);

            if(userToken.length > 0){
                return {message: 'Token is updated', token: token, username: username};
            }
            else{
                return {message: 'Token is not updated', token: 0, username: username};
            }
        }
        catch (e) {
            //Send response with error data
            return {message: e.detail, token: 0};
        }
    }

    async updateUserActiveStatus(username = '', id = 0, token = ''){
        try{
            //Generate token
            const tokenNew = generators.randomTokenKey();

            //Update User active status and Token to new one
            const userActivation = await db.query(
                'UPDATE Users set token = $4, user_is_active = 1 WHERE (username = $1 OR id = $2) AND token = $3 AND user_is_active != 1 RETURNING *'
                , [username, id, token, tokenNew]);

            if(userActivation.length > 0){
                return {message: 'User is Active now', token: tokenNew, username: username};
            }
            else{
                return {message: 'User does not exist for passed data', token: 0, username: username};
            }
        }
        catch (e) {
            //Send response with error data
            return {message: e.detail, token: 0};
        }
    }

    async checkUserRights(token = 0, rights = []){
        try{
            const rightsCheckData = await db.query(
                'SELECT UserType.title, UserType.rights FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.token = $1'
                , [token]);

            //Rights Compare logic
            if(rightsCheckData.length > 0){
                //Reformat (add quotes to keys if not exist) and convert rights string from DB to JSON object
                const rightsFormatted = rightsCheckData[0].rights.replace(/(\w+:)|(\w+ :)/g, function(s) {
                    return '"' + s.substring(0, s.length-1) + '":';
                });
                const rightsObject = JSON.parse(rightsFormatted);

                let haveRights = false;
                //Go through all passed rights and change value according it
                rights.forEach((item) => {
                    haveRights = rightsObject[item];
                });

                if(haveRights)
                {
                    return {message: 'You have rights', role: rightsCheckData[0].title, token: token};
                }
                else{
                    return {message: 'You does not have enough rights to use this method', role: rightsCheckData[0].title, token: 0};
                }
            }
            else
            {
                return {message: 'Token is not ok', role: 'None', token: 0};
            }
        }
        catch (e) {
            //Send response with error data
            console.log(e);
            return {message: e.detail ? e.detail : e};
        }
    }

    async checkUserExist(username = '', id = 0){
        try{
            const getUser = await db.query(
                'SELECT Users.username FROM Users WHERE (Users.username = $1 OR Users.id = $2)'
                , [username, id]);

            if(getUser.length >0)
            {
                return {message: 'User exist', username: username, id: id, exist: true};
            }
            else{
                return {message: 'User does not exist for passed data', username: username, id: id, exist: false};
            }
        }
        catch (e) {
            //Send response with error data
            return {message: e.detail, username: '', id: 0};
        }
    }

    async checkUserActiveStatus(username = '', id = 0){
        try{
            const isUserExistObject = new AuthorizationController();
            const isUserExist = await isUserExistObject.checkUserExist(username, id);

            if(isUserExist.exist){
                const getUserStatus = await db.query(
                    'SELECT Users.username FROM Users WHERE (Users.username = $1 OR Users.id = $2) AND user_is_active != 0'
                    , [username, id]);

                if(getUserStatus.length >0)
                {
                    return {message: 'User is active', username: username, id: id};
                }
                else{
                    return {message: 'User is not active', username: username, id: id};
                }
            }
            else{
                return isUserExist;
            }
        }
        catch (e) {
            //Send response with error data
            return {message: e.detail, username: '', id: 0};
        }
    }
}

module.exports = new AuthorizationController();