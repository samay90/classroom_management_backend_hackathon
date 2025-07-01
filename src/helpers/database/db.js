const mysql = require("mysql2")
require("dotenv").config()
const db = mysql.createPool({
    database:process.env.MYSQL_DB_NAME,
    password:process.env.MYSQL_DB_PASSWORD,
    user:process.env.MYSQL_DB_USER,
    host:process.env.MYSQL_DB_HOST,
    port:process.env.MYSQL_DB_PORT
})

module.exports = db