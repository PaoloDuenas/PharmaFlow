const express = require("express");
const router = express.Router();
const redisClient = require("../config/redis");

// --- (POST /api/config/precio-dolar) ---
// Guardar el precio del dólar en Redis
router.post("/precio-dolar", async (req, res) => {
  const { precio } = req.body;
  if (!precio) {
    return res.status(400).json({ message: 'Se requiere un "precio"' });
  }

  // Guardamos este valor simple con la clave 'precio_dolar'
  await redisClient.set("precio_dolar", precio);
  res.json({ message: "Precio del dólar actualizado" });
});

// --- (GET /api/config/precio-dolar) ---
// Leer el precio del dólar desde Redis
router.get("/precio-dolar", async (req, res) => {
  const precio = await redisClient.get("precio_dolar");
  if (!precio) {
    return res.status(404).json({ message: "Precio del dólar no establecido" });
  }
  res.json({ precio_dolar: precio });
});

module.exports = router;
