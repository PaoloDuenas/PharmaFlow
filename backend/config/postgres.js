const { Pool } = require("pg");

const pool = new Pool({
  user: "admin_pharma",
  host: "localhost",
  database: "pharmaflow_db",
  password: "admin_password123",
  port: 5432,
});


// Exportamos el pool COMPLETO
module.exports = pool;
