const pgp = require("pg-promise")(/*options*/);
const connection = {
    host: 'localhost',
    port: 5432,
    database: 'knowasong',
    user: 'postgres',
    password: 'root',
    max: 30 // use up to 30 connections

    // "types" - in case you want to set custom type parsers on the pool level
};
const db = pgp(connection);

module.exports = db;