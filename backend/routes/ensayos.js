const express = require("express");
const router = express.Router();
const Ensayo = require("../models/Ensayo"); // Importamos nuestro modelo

const { checkAuth, checkRole } = require("../middleware/checkAuth");

// --- (POST /api/ensayos) ---
// Crear un nuevo reporte de ensayo clínico
router.post(
  "/",
  checkAuth,
  checkRole(["Gerente", "Farmaceutico"]),
  async (req, res) => {
    try {
      // Simplemente tomamos CUALQUIER JSON que venga en el body
      // y creamos un nuevo 'Ensayo' con él.
      // Gracias a 'strict: false', guardará todo.
      const nuevoEnsayo = new Ensayo(req.body);
      await nuevoEnsayo.save();

      res.status(201).json({
        message: "Reporte de ensayo guardado exitosamente",
        data: nuevoEnsayo,
      });
    } catch (err) {
      res.status(400).json({
        message: "Error al guardar el reporte",
        error: err.message,
      });
    }
  }
);

// --- (GET /api/ensayos) ---
// Obtener todos los reportes de ensayos
router.get(
  "/",
  checkAuth,
  checkRole(["Gerente", "Farmaceutico", "Investigador"]),
  async (req, res) => {
    try {
      const ensayos = await Ensayo.find(); // Busca todos los documentos
      res.json(ensayos);
    } catch (err) {
      res.status(500).json({
        message: "Error al recuperar los reportes",
        error: err.message,
      });
    }
  }
);

module.exports = router;
