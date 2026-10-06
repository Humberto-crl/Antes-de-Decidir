// Envuelve un controller async para que cualquier error llegue al errorHandler
// sin tener que escribir try/catch en cada función.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
