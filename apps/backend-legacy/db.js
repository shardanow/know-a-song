const pgp = require("pg-promise")(/*options*/);
const connection = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 30 // use up to 30 connections

    // "types" - in case you want to set custom type parsers on the pool level
};
const db = pgp(connection);

module.exports = db;