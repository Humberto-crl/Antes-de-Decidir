const pool = require('../config/db');

async function obtenerTodas() {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    return rows;
}

async function obtenerPorId(id) {
    const [rows] = await pool.query(
        'SELECT * FROM categorias WHERE id_categoria ? ?',
        [id]
    );
    return rows[0];
}

async function crear(nombre, descripcion) {
    const [rows] = await pool.query(
        'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion]
    );
    return { id_categoria: result.insertId, nombre, descripcion};
}

module.exports = {obtenerTodas, obtenerPorId, crear};