class AppResponse {
  constructor({message, statusCode, body} = {}) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = body;
  }
}
module.exports = AppResponse;
