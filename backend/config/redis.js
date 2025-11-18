const Redis = require("ioredis");

// ioredis se conectará automáticamente a localhost:6379,
// que es donde Docker está exponiendo nuestro Redis.
const redisClient = new Redis();

redisClient.on("connect", () => {
  console.log("¡Conexión exitosa a Redis establecida! 🔴");
});

redisClient.on("error", (err) => {
  console.error("Error al conectar con Redis:", err);
});

module.exports = redisClient;
