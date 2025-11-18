# 💊 PharmaFlow Solutions - Backend

Sistema integral de gestión farmacéutica desarrollado como proyecto final. Este sistema implementa una arquitectura políglota que combina bases de datos **Relacionales** (ACID) y **NoSQL** (Documentos, Clave-Valor y Grafos).

## 🚀 Tecnologías Utilizadas

* **Backend:** Node.js + Express
* **Orquestación:** Docker & Docker Compose
* **Bases de Datos:** PostgreSQL, MongoDB, Redis, Neo4j.

---

## 🛠️ Instrucciones de Instalación y Ejecución

### 1. Levantar la Infraestructura de Datos
En la raíz del proyecto (donde está el `docker-compose.yml`):

```bash
docker-compose up -d
```

### 2. Instalar Dependencias del Backend
Navega a la carpeta del servidor:

```bash
cd backend
npm install
```

### 3. Iniciar el Servidor
```bash
npm start
```
El servidor correrá en: `http://localhost:3000`

---

## 🧪 Guía de Pruebas (Endpoints Principales)

### 🔐 Autenticación y Roles (Redis + Postgres)
* **Login:** `POST /api/auth/login`
* **Body:** `{ "nombre_usuario": "gerente1", "password": "password123" }`
* **Nota:** Recibirás un token. Úsalo en el Header `Authorization: Bearer <TOKEN>` para las peticiones protegidas.

### 📉 Control de Concurrencia (PostgreSQL)
Para probar el bloqueo pesimista:
* **Endpoint:** `POST /api/ventas`
* **Body:** `{ "lote_id": 3, "cantidad_vendida": 1 }`
* **Prueba:** Envía esta petición desde dos terminales al mismo tiempo. Una tendrá éxito (201) y la otra fallará (400).

### 📄 Ensayos Clínicos (MongoDB)
* **Crear Reporte:** `POST /api/ensayos` (JSON flexible).
* **Listar Reportes:** `GET /api/ensayos`

### 🔗 Interacciones de Medicamentos (Neo4j)
* **Poblar BD (Solo Gerente):** `POST /api/interacciones/poblar`
* **Consultar Interacciones:** `GET /api/interacciones/Aspirina`

---

## 🐳 Credenciales de Bases de Datos (Docker)

| Servicio | Puerto | Usuario | Contraseña | Base de Datos |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | 5432 | `admin_pharma` | `admin_password123` | `pharmaflow_db` |
| **MongoDB** | 27017 | `admin_mongo` | `admin_password123` | `pharmaflow_mongo_db` |
| **Redis** | 6379 | - | - | - |
| **Neo4j** | 7474 | `neo4j` | `admin_password123` | - |
