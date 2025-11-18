const neo4j = require("neo4j-driver");

// Estas son las credenciales y la URL del puerto Bolt
const URI = "neo4j://localhost:7687";
const USER = "neo4j";
const PASSWORD = "admin_password123";

let driver;

try {
  // Creamos la instancia del driver
  driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

  // Verificamos la conexión
  driver
    .verifyConnectivity()
    .then(() => console.log("¡Conexión exitosa a Neo4j establecida! 🌳"))
    .catch((err) => console.error("Error al conectar con Neo4j:", err));
} catch (err) {
  console.error("Error al crear el driver de Neo4j:", err);
}

// Exportamos el driver para que las rutas puedan crear sesiones
module.exports = driver;
