const express = require("express");
const router = express.Router();
const driver = require("../config/neo4j"); // Importamos el driver

// ¡CAMBIO AQUÍ! Importamos los middlewares
const { checkAuth, checkRole } = require("../middleware/checkAuth");

// --- (POST /api/interacciones/poblar) ---
// Endpoint de ayuda para poblar la base de datos con datos de ejemplo
router.post("/poblar", checkAuth, checkRole(["Gerente"]), async (req, res) => {
  const session = driver.session(); // Abrimos una sesión
  try {
    // Usamos MERGE en lugar de CREATE para evitar duplicados si se corre varias veces
    const query = `
      MERGE (m1:Medicamento {nombre: 'Aspirina'})
      MERGE (m2:Medicamento {nombre: 'Ibuprofeno'})
      MERGE (m3:Medicamento {nombre: 'Warfarina'})

      MERGE (pa1:PrincipioActivo {nombre: 'Ácido acetilsalicílico'})
      MERGE (pa2:PrincipioActivo {nombre: 'Ibuprofeno'})
      MERGE (pa3:PrincipioActivo {nombre: 'Warfarina'})

      MERGE (m1)-[:CONTIENE_PRINCIPIO]->(pa1)
      MERGE (m2)-[:CONTIENE_PRINCIPIO]->(pa2)
      MERGE (m3)-[:CONTIENE_PRINCIPIO]->(pa3)

      // Creamos las interacciones (El núcleo del requisito)
      MERGE (pa1)-[:INTERACTUA_CON {riesgo: 'Alto'}]->(pa3)
      MERGE (pa2)-[:INTERACTUA_CON {riesgo: 'Moderado'}]->(pa3)
    `;

    await session.run(query);
    res
      .status(201)
      .json({ message: "Base de datos de grafos poblada con éxito" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error al poblar Neo4j", error: err.message });
  } finally {
    await session.close(); // Cerramos la sesión
  }
});

// --- (GET /api/interacciones/:medicamento) ---
// Consultar con qué otros medicamentos interactúa un medicamento (Requisito 4.4)
router.get(
  "/:medicamentoNombre",
  checkAuth,
  checkRole(["Gerente", "Farmaceutico", "Investigador"]),
  async (req, res) => {
    const { medicamentoNombre } = req.params;
    const session = driver.session();

    try {
      // Esta es la consulta de grafos
      // "Encuentra el medicamento (m1), sigue su principio activo (pa1),
      // busca con qué otro principio activo (pa2) interactúa,
      // y finalmente, encuentra qué medicamento (m2) contiene ese principio activo (pa2)."
      const query = `
      MATCH (m1:Medicamento {nombre: $nombre})
            -[:CONTIENE_PRINCIPIO]->(pa1:PrincipioActivo)
            -[:INTERACTUA_CON]-(pa2:PrincipioActivo)
            <-[:CONTIENE_PRINCIPIO]-(m2:Medicamento)
      RETURN m2.nombre AS medicamento_interactivo, pa1.nombre AS principio_activo_base, pa2.nombre AS principio_activo_interactivo
    `;

      const result = await session.run(query, { nombre: medicamentoNombre }); // Mapeamos los resultados a un formato JSON limpio

      const interacciones = result.records.map((record) => ({
        medicamento: record.get("medicamento_interactivo"),
        principio_base: record.get("principio_activo_base"),
        interactua_con: record.get("principio_activo_interactivo"),
      }));

      if (interacciones.length === 0) {
        return res.status(404).json({
          message: "No se encontraron interacciones para ese medicamento",
        });
      }

      res.json(interacciones);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error al consultar Neo4j", error: err.message });
    } finally {
      await session.close();
    }
  }
);

module.exports = router;
