CREATE TABLE usuarios(
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    correo VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE categorias(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE situaciones(
    id_situacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_categoria INT,
    titulo VARCHAR(150),
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_usuario)
    REFERENCES usuarios(id_usuario),

    FOREIGN KEY(id_categoria)
    REFERENCES categorias(id_categoria)
);

CREATE TABLE factores(
    id_factor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE situacion_factor(
    id_situacion_factor INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT,
    id_factor INT,
    valor VARCHAR(255),

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion),

    FOREIGN KEY(id_factor)
    REFERENCES factores(id_factor)
);

CREATE TABLE analisis(
    id_analisis INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT,
    observaciones TEXT,
    informacion_faltante TEXT,
    fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
);

CREATE TABLE alternativas(
    id_alternativa INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT,
    nombre VARCHAR(100),
    descripcion TEXT,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
);

CREATE TABLE escenarios(
    id_escenario INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT,
    nombre VARCHAR(100),
    descripcion TEXT,
    resultado TEXT,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
);

CREATE TABLE checklist(
    id_checklist INT AUTO_INCREMENT PRIMARY KEY,
    id_situacion INT,
    item VARCHAR(255),
    completado BOOLEAN DEFAULT FALSE,

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
);

CREATE TABLE historial(
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_situacion INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_usuario)
    REFERENCES usuarios(id_usuario),

    FOREIGN KEY(id_situacion)
    REFERENCES situaciones(id_situacion)
);