const mysql = require("mysql2/promise");

// Conexión a MySQL usando XAMPP.
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "Score",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;