const AppError = require("./AppError");

module.exports = class GeneralErrorsFactory {
  constructor() {}

  static invalidTokenErr({ customMessage } = {}) {
    return new AppError({
      message: customMessage || "invalid token",
      statusCode: 400,
    });
  }

  static invalidAccessErr({ customMessage } = {}) {
    return new AppError({
      message: customMessage || "invalid access",
      statusCode: 401,
    });
  }

  static badRequestErr({ customMessage } = {}) {
    return new AppError({
      message: customMessage || "bad request",
      statusCode: 400,
    });
  }

  static notFoundErr({ customMessage } = {}) {
    return new AppError({
      message: customMessage || "Not found",
      statusCode: 404,
    });
  }

  static internalErr({ customMessage, statusCode, err } = {}) {
    return new AppError({
      message: customMessage || "Something went wrong",
      statusCode: statusCode || 500,
      err,
    });
  }
};
