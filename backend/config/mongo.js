const mongoose = require("mongoose");

// Esta es la "cadena de conexión" para MongoDB
// Apunta a localhost:27017, usa las credenciales de admin_mongo,
// se conecta a la base de datos 'pharmaflow_mongo_db' y usa 'admin' como fuente de autenticación.
const MONGO_URI =
  "mongodb://admin_mongo:admin_password123@localhost:27017/pharmaflow_mongo_db?authSource=admin";

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("¡Conexión exitosa a MongoDB establecida! 🍃");
  } catch (err) {
    console.error("Error al conectar con MongoDB:", err.message);
    // Salimos del proceso con error si no podemos conectarnos
    process.exit(1);
  }
};

module.exports = connectMongo;
