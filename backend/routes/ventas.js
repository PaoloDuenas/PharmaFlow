const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");

// Importamos los middlewares
const { checkAuth, checkRole } = require("../middleware/checkAuth");

// Endpoint para crear una venta (Manejo de Concurrencia)
// POST /api/ventas
router.post(
  "/",
  checkAuth,
  checkRole(["Gerente", "Farmaceutico"]),
  async (req, res) => {
    const { lote_id, cantidad_vendida } = req.body;
    // Lo obtenemos del usuario autenticado por el middleware (req.user)
    const usuario_id = req.user.id; // 1. "Reservar" un cliente del pool de conexiones

    const client = await pool.connect();

    try {
      // 2. Iniciar la transacción (Modo ACID)
      await client.query("BEGIN"); // 3. EL PASO CRÍTICO (Bloqueo Pesimista)

      const queryLote = "SELECT * FROM Lotes WHERE id = $1 FOR UPDATE";
      const loteResult = await client.query(queryLote, [lote_id]);

      if (loteResult.rows.length === 0) {
        throw new Error("El lote no existe");
      }

      const lote = loteResult.rows[0]; // 4. Verificar la lógica de negocio (¿Hay stock?)

      if (lote.cantidad_stock < cantidad_vendida) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Stock insuficiente. Venta cancelada.",
        });
      } // 5. Si hay stock, actualizamos la base de datos

      const nuevaCantidad = lote.cantidad_stock - cantidad_vendida;
      const updateQuery = "UPDATE Lotes SET cantidad_stock = $1 WHERE id = $2";
      await client.query(updateQuery, [nuevaCantidad, lote_id]); // Registrar la venta en la tabla 'Ventas'

      const montoTotal = lote.precio_venta * cantidad_vendida;
      const insertVentaQuery = `
      INSERT INTO Ventas (lote_id, usuario_id, cantidad_vendida, monto_total)
      VALUES ($1, $2, $3, $4)
    `;
      // El "usuario_id" de aquí ahora es el ID seguro del token
      await client.query(insertVentaQuery, [
        lote_id,
        usuario_id,
        cantidad_vendida,
        montoTotal,
      ]); // 6. Si todo salió bien, confirmamos la transacción

      await client.query("COMMIT");

      res.status(201).json({
        message: "¡Venta registrada con éxito!",
        nuevo_stock: nuevaCantidad,
      });
    } catch (error) {
      // 7. Si algo falló (error de BD, etc.), abortamos la transacción
      await client.query("ROLLBACK");
      console.error("Error en la transacción de venta:", error);
      res.status(500).json({
        message: "Error en el servidor al procesar la venta",
        error: error.message,
      });
    } finally {
      // 8. ¡MUY IMPORTANTE! Liberar el cliente
      client.release();
    }
  }
);

module.exports = router;
