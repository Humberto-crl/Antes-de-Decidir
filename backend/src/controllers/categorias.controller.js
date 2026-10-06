const categoriasService = require('../services/categorias.services');

async function listar(req, res) {
  try {
    const categorias = await categoriasService.obtenerTodas();
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las categorías' });
  }
}

async function obtener(req, res) {
  try {
    const categoria = await categoriasService.obtenerPorId(req.params.id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la categoría' });
  }
}

async function crear(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }
    const nueva = await categoriasService.crear(nombre, descripcion);
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la categoría' });
  }
}

module.exports = { listar, obtener, crear };