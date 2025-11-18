const mongoose = require("mongoose");

const ensayoSchema = new mongoose.Schema(
  {
    // --- Campos que esperamos que CASI SIEMPRE estén ---
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    fase_ensayo: {
      type: Number,
      required: true,
    },
    fecha_inicio: {
      type: Date,
      default: Date.now,
    },
    // No definimos más campos. ¿Por qué?
    // Porque queremos que el usuario pueda guardar CUALQUIER otra cosa.
    // ej: { "pacientes": [...], "efectos_adversos": {...}, "notas_doctor": "..." }
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente

    // ¡ESTA ES LA LÍNEA MÁGICA PARA EL REQUISITO 4.2!
    // 'strict: false' le dice a Mongoose que acepte y guarde
    // campos que NO están definidos en este esquema.
    strict: false,
  }
);

// Exportamos el modelo para usarlo en nuestras rutas
module.exports = mongoose.model("Ensayo", ensayoSchema);
