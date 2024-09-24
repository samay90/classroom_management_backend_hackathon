const mysql = require("mysql")

const db = mysql.createPool({
    database:"appointment_booking",
    password:"password",
    user:"root",
    host:"localhost"
})

module.exports = db