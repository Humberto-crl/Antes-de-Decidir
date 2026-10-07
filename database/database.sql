DROP DATABASE IF EXISTS antes_de_decidir;
CREATE DATABASE IF NOT EXISTS antes_de_decidir CHARACTER SET utf8mb4;
USE antes_de_decidir;

CREATE TABLE usuarios(
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE categorias(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE factores(
    id_factor INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,

    FOREIGN KEY(id_categoria)
    REFERENCES categorias(id_categoria)
);

CREATE TABLE situaciones(
    id_situacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estado ENUM('no_iniciado','pendiente','en_progreso','completado') DEFAULT 'no_iniciado',
    progreso TINYINT DEFAULT 0,

    FOREIGN KEY(id_usuario)
    REFERENCES usuarios(id_usuario),

    FOREIGN KEY(id_categoria)
    REFERENCES categorias(id_categoria)
);

CREATE TABLE situacion_factor(
    id_situacion_factor INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT NOT NULL,
    id_factor INT NOT NULL,
    valor VARCHAR(255),

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
    ON DELETE CASCADE,

    FOREIGN KEY(id_factor)
    REFERENCES factores(id_factor)
);

CREATE TABLE analisis(
    id_analisis INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT NOT NULL,
    observaciones TEXT,
    informacion_faltante TEXT,
    fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
    ON DELETE CASCADE
);

CREATE TABLE alternativas(
    id_alternativa INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
    ON DELETE CASCADE
);

CREATE TABLE alternativa_factor(
    id_alternativa_factor INT AUTO_INCREMENT PRIMARY KEY,
    id_alternativa INT NOT NULL,
    id_factor INT NOT NULL,
    valor VARCHAR(255),

    FOREIGN KEY(id_alternativa)
    REFERENCES alternativas(id_alternativa)
    ON DELETE CASCADE,

    FOREIGN KEY(id_factor)
    REFERENCES factores(id_factor)
);

CREATE TABLE escenarios(
    id_escenario INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    variables JSON,
    resultado TEXT,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
    ON DELETE CASCADE
);

CREATE TABLE checklist(
    id_checklist INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT NOT NULL,
    item VARCHAR(255) NOT NULL,
    completado BOOLEAN DEFAULT FALSE,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
    ON DELETE CASCADE
);

CREATE TABLE historial(
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_situacion INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_usuario)
    REFERENCES usuarios(id_usuario),

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
    ON DELETE CASCADE
);
