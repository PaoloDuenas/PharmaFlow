-- Habilita la extensión pgcrypto para cifrado, aunque usaremos bcrypt en la app
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------ (Requisito 5.4, 5.5) ------
-- 1. CREACIÓN DE TIPOS (ENUMs)
-- Definimos un TIPO para los roles de la aplicación, esto es más
-- eficiente que usar VARCHAR y nos da integridad de datos.
CREATE TYPE TIPO_ROL AS ENUM ('Gerente', 'Farmaceutico', 'Investigador');


-- ------ (Requisito 5.1) ------
-- 2. CREACIÓN DE TABLAS (Estructuras Lógicas)

-- Tabla para los usuarios del sistema
CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Guardaremos el hash de bcrypt aquí
    rol TIPO_ROL NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla "maestra" de medicamentos
CREATE TABLE Medicamentos (
    id SERIAL PRIMARY KEY,
    nombre_comercial VARCHAR(255) NOT NULL,
    nombre_cientifico VARCHAR(255),
    descripcion TEXT
);

-- Tabla para lotes de inventario (LA MÁS CRÍTICA)
-- Esta es la tabla sobre la que haremos el control de concurrencia
CREATE TABLE Lotes (
    id SERIAL PRIMARY KEY,
    medicamento_id INT NOT NULL REFERENCES Medicamentos(id),
    numero_lote VARCHAR(100) NOT NULL UNIQUE,
    cantidad_stock INT NOT NULL CHECK (cantidad_stock >= 0), -- No podemos tener stock negativo
    fecha_caducidad DATE NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL CHECK (precio_venta > 0)
);

-- Tabla para registrar las transacciones de venta
CREATE TABLE Ventas (
    id SERIAL PRIMARY KEY,
    lote_id INT NOT NULL REFERENCES Lotes(id),
    usuario_id INT NOT NULL REFERENCES Usuarios(id), -- Qué usuario (Farmaceutico/Gerente) hizo la venta
    cantidad_vendida INT NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------ (Requisito 5.1) ------
-- 3. CREACIÓN DE ÍNDICES (Estructuras Físicas para Optimización)
-- Justificación: Optimizamos las consultas más comunes.

-- JUSTIFICACIÓN: Acelera la búsqueda de medicamentos por su nombre comercial.
CREATE INDEX idx_medicamentos_nombre_comercial ON Medicamentos(nombre_comercial);

-- JUSTIFICACIÓN: Acelera la búsqueda de lotes por fecha de caducidad (para reportes de stock a expirar).
CREATE INDEX idx_lotes_fecha_caducidad ON Lotes(fecha_caducidad);

-- JUSTIFICACIÓN: Acelera las consultas de reportes de ventas por fecha.
CREATE INDEX idx_ventas_fecha_venta ON Ventas(fecha_venta);

-- JUSTIFICACIÓN: Los índices en Claves Foráneas aceleran los JOINs.
CREATE INDEX idx_lotes_medicamento_id ON Lotes(medicamento_id);
CREATE INDEX idx_ventas_lote_id ON Ventas(lote_id);
CREATE INDEX idx_ventas_usuario_id ON Ventas(usuario_id);

-- --- (Opcional) ---
-- 4. Inserción de datos de prueba
INSERT INTO Usuarios (nombre_usuario, password_hash, rol) VALUES 
('gerente1', 'hash_de_prueba_gerente', 'Gerente'),
('farmaceutico1', 'hash_de_prueba_farma', 'Farmaceutico'),
('investigador1', 'hash_de_prueba_invest', 'Investigador');

INSERT INTO Medicamentos (nombre_comercial, nombre_cientifico) VALUES
('Aspirina', 'Ácido acetilsalicílico'),
('Paracetamol', 'Paracetamol'),
('Ibuprofeno', 'Ibuprofeno');

INSERT INTO Lotes (medicamento_id, numero_lote, cantidad_stock, fecha_caducidad, precio_venta) VALUES
(1, 'LOTE-ASP-001', 100, '2026-12-31', 50.00),
(2, 'LOTE-PAR-001', 50, '2025-06-30', 35.50),
(3, 'LOTE-IBU-001', 1, '2025-11-30', 45.00); -- Lote con 1 unidad para probar concurrencia