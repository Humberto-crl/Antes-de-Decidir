function notFound(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Todos los errores del backend terminan aquí.
function errorHandler(err, req, res, next) {
  if (err.status) return res.status(err.status).json({ mensaje: err.message });
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El JSON enviado no es válido' });
  }
  switch (err.code) {
    case 'ER_DUP_ENTRY':
      return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos' });
    case 'ER_NO_REFERENCED_ROW_2':
      return res.status(400).json({ mensaje: 'Referencia inválida: algún id enviado no existe' });
    case 'ER_ROW_IS_REFERENCED_2':
      return res.status(409).json({ mensaje: 'No se puede eliminar: tiene datos relacionados' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
