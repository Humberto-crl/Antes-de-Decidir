// Error con código HTTP. Se lanza con: throw new HttpError(404, 'No encontrado')
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
