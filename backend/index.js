const express = require("express");
const app = express();
const PORT = 3000;

// --- CONEXIONES A BD ---
const connectMongo = require("./config/mongo");
const redisClient = require("./config/redis");
const neo4jDriver = require("./config/neo4j"); // <-- 1. IMPORTAR DRIVER NEO4J

// --- IMPORTAR RUTAS ---
const ventasRoutes = require("./routes/ventas");
const ensayosRoutes = require("./routes/ensayos");
const authRoutes = require("./routes/auth");
const configRoutes = require("./routes/configuracion");
const interaccionesRoutes = require("./routes/interacciones"); // <-- 2. IMPORTAR RUTAS GRAFOS

// --- CONECTAR A BASES DE DATOS ---
connectMongo();

// Middleware para entender JSON
app.use(express.json());

// --- RUTAS DE API ---
app.get("/", (req, res) => {
  res.json({
    message: "¡Bienvenido a la API de PharmaFlow Solutions!",
    status: "ok",
  });
});

app.use("/api/ventas", ventasRoutes);
app.use("/api/ensayos", ensayosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/interacciones", interaccionesRoutes); // <-- 3. USAR RUTAS GRAFOS

// --- Fin de Rutas ---

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(
    `Servidor de PharmaFlow API corriendo en http://localhost:${3000}`
  );
});
