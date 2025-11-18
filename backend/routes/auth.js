const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // Módulo de Node para generar tokens

const pool = require("../config/postgres"); // Pool de PostgreSQL
const redisClient = require("../config/redis"); // Cliente de Redis

const { checkAuth, checkRole } = require("../middleware/checkAuth");

// --- (POST /api/auth/register) ---
// Crear un nuevo usuario (Gerente, Farmaceutico, etc.)
router.post(
  "/register",
  checkAuth,
  checkRole(["Gerente"]),
  async (req, res) => {
    const { nombre_usuario, password, rol } = req.body;

    if (!["Gerente", "Farmaceutico", "Investigador"].includes(rol)) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    try {
      // Hashear la contraseña antes de guardarla
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt); // Guardar en PostgreSQL

      const newUserQuery = `
      INSERT INTO Usuarios (nombre_usuario, password_hash, rol)
      VALUES ($1, $2, $3)
      RETURNING id, nombre_usuario, rol
    `;
      const result = await pool.query(newUserQuery, [
        nombre_usuario,
        password_hash,
        rol,
      ]);

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        usuario: result.rows[0],
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error al registrar el usuario", error: err.message });
    }
  }
);

// --- (POST /api/auth/login) ---
// Iniciar sesión y crear un token en Redis (Requisito 4.3)
// cualquiera pueda intentar autenticarse.
router.post("/login", async (req, res) => {
  const { nombre_usuario, password } = req.body;

  try {
    // 1. Buscar al usuario en PostgreSQL
    const userQuery = "SELECT * FROM Usuarios WHERE nombre_usuario = $1";
    const result = await pool.query(userQuery, [nombre_usuario]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
      B_;
    }

    const usuario = result.rows[0]; // 2. Comparar la contraseña (la de la BD con la que mandó el usuario)

    const esValida = await bcrypt.compare(password, usuario.password_hash);

    if (!esValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    } // 3. ¡Éxito! Generar Token y Guardar en REDIS

    const token = crypto.randomBytes(32).toString("hex"); // Un token aleatorio
    const sesionData = {
      id: usuario.id,
      rol: usuario.rol,
    }; // Guardamos el token en Redis por 1 hora (3600 segundos)

    await redisClient.set(token, JSON.stringify(sesionData), "EX", 3600);

    res.json({
      message: "Login exitoso",
      token: token,
      rol: usuario.rol,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
});

module.exports = router;
