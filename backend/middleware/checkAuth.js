const redisClient = require("../config/redis");

// Este es el middleware principal de autenticación
const checkAuth = async (req, res, next) => {
  try {
    // 1. Obtener el token del header "Authorization"
    // El formato esperado es: "Bearer <token>"
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Acceso denegado. No se proporcionó token." });
    }

    // 2. Buscar el token en Redis
    const sesionDataString = await redisClient.get(token);

    if (!sesionDataString) {
      return res
        .status(401)
        .json({ message: "Token inválido o la sesión ha expirado." });
    }

    // 3. Si el token es válido, adjuntamos los datos del usuario (id, rol)
    // a la petición (req) para que el siguiente endpoint pueda usarlo.
    req.user = JSON.parse(sesionDataString);

    // 4. Continuar al siguiente middleware o a la ruta principal
    next();
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error en el servidor de autenticación",
        error: err.message,
      });
  }
};

// Este es un middleware de autorización (control de rol)
// Es una "función que retorna una función" (higher-order function)
const checkRole = (rolesPermitidos) => {
  // Esta es la función de middleware que Express usará
  return (req, res, next) => {
    // req.user fue adjuntado por el middleware checkAuth
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        message: "Acceso prohibido. No tienes el rol necesario.",
      });
    }
    // Si el rol es correcto, ¡adelante!
    next();
  };
};

module.exports = { checkAuth, checkRole };
