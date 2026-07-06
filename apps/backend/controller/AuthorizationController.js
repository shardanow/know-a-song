const db = require('../db');
const generators = require('../helpers/generators');

class AuthorizationController {
    authorizeUser = async (request, response) => {
        let {username, password} = request.body;

        try {
            const getUser = await db.query(
                'SELECT Users.username, Users.password FROM Users WHERE Users.username = $1'
                , [username]);

            //Authorization logic
            if (getUser.length > 0) {
                //Compare user hashed pass to sent one
                if (generators.decryptStringData(getUser[0].password) === password) {
                    //Send 200 response with data and Update User Token
                    return response.status(200).json({
                        message: 'Authorize was success',
                        token: await this.updateUserToken(username).token
                    });
                } else {
                    //Send 403 response with data
                    return response.status(403).json({message: 'Authorize was failed', token: 0});
                }
            } else {
                //Send 403 response with data
                return response.status(403).json({message: 'User does not exist for passed data', token: 0});
            }
        } catch (e) {
            console.log(e)
            //Send 409 response with error data
            return response.status(409).json({message: e.detail});
        }
    }

    activateUser = async (request, response) => {
        let {username, id, token} = request.body;

        const userActivationStatus = await this.updateUserActiveStatus(username, id, token);

        if (userActivationStatus.token !== 0) {
            //Send 200 response with data
            return response.status(200).json({
                message: userActivationStatus.message,
                username: username,
                token: userActivationStatus.token
            });
        } else {
            //Send 403 response with data
            return response.status(403).json({message: userActivationStatus.message, username: username, token: 0});
        }
    }

    updateUserToken = async (username = '') => {
        try {
            //Generate token
            const token = generators.randomTokenKey();

            //Update User Token to new one
            const userToken = await db.query(
                'UPDATE Users set token = $2 WHERE username = $1 RETURNING *'
                , [username, token]);

            if (userToken.length > 0) {
                return {message: 'Token is updated', token: token, username: username};
            } else {
                return {message: 'Token is not updated', token: 0, username: username};
            }
        } catch (e) {
            //Send response with error data
            return {message: e.detail, token: 0};
        }
    }

    updateUserActiveStatus = async (username = '', id = 0, token = '') => {
        try {
            //Generate token
            const tokenNew = generators.randomTokenKey();

            //Update User active status and Token to new one
            const userActivation = await db.query(
                'UPDATE Users set token = $4, user_is_active = 1 WHERE (username = $1 OR id = $2) AND token = $3 AND user_is_active != 1 RETURNING *'
                , [username, id, token, tokenNew]);

            if (userActivation.length > 0) {
                return {message: 'User is Active now', token: tokenNew, username: username};
            } else {
                return {message: 'User does not exist for passed data', token: 0, username: username};
            }
        } catch (e) {
            //Send response with error data
            return {message: e.detail, token: 0};
        }
    }

}

module.exports = new AuthorizationController();