const db = require('../db');
let CryptoJS = require("crypto-js");
require('dotenv').config();

class UserController{
    randomGenerator(){
        let rand = function() {
            return Math.random().toString(36).substring(2); // remove `0.`
        };

        const token = function() {
            return rand() + rand(); // to make it longer
        };

        return token();
    }

    async createUser(request, response){
        let {username, password} = request.body;
        // Encrypt Password
        password = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY_SALT).toString();
        const token = this.randomGenerator();
        const newUser = await db.query(
            'INSERT INTO Users(username, password, token) VALUES ($1, $2, $3) RETURNING *'
            , [username, password, token]);

        console.info(newUser);
        response.json(newUser);
    }

    async getUsers(request, response){
        const getUsers = await db.query(
            'SELECT Users.username, Users.password, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id');

        console.info(getUsers);
        response.json(getUsers);
    }

    async getUserByID(request, response){
        const {id} = request.params;
        const getUser = await db.query(
            'SELECT Users.username, Users.password, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.id = $1'
            , [id]);

        console.info(getUser);
        response.json(getUser);
    }

    async getUserByUsername(request, response){
        const {username} = request.params;
        const getUser = await db.query(
            'SELECT Users.username, Users.password, Users.last_login, UserType.title FROM Users JOIN UserType ON Users.user_type_id = UserType.id WHERE Users.username = $1'
            , [username]);

        console.info(getUser);
        response.json(getUser);
    }

    async updateUser(request, response){
        const {username, password, user_type_id} = request.body;
        const token = this.randomGenerator();
        const {id} = request.params;
        const updateUser = await db.query(
            'UPDATE Users set username = $2, password = $3, token = $4, user_type_id = $5 WHERE id = $1 RETURNING *'
            , [id, username, password, token, user_type_id]);

        console.info(updateUser);
        response.json(updateUser);
    }

    async deleteUser(request, response){
        const {id} = request.params;
        const deleteUser = await db.query(
            'DELETE FROM Users WHERE id = $1 RETURNING *'
            , [id]);

        console.info(deleteUser);
        response.json(deleteUser);
    }
}

module.exports = new UserController();