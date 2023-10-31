const AppError = require("./AppError");

module.exports = class UsersErrorsFactory {
  constructor() {}

  static userAlreadyRegisteredErr() {
    return new AppError({
      message: "user already registered",
      statusCode: 400,
    });
  }

  static userNotSuperAdminErr() {
    return new AppError({
      message: "User role Super Admin not accepted",
      statusCode: 400,
    });
  }

  static userNotFoundErr() {
    return new AppError({
      message: "user not found",
      statusCode: 404,
    });
  }

  static wrongEmailOrPasswordErr() {
    return new AppError({
      message: "wrong credentials",
      statusCode: 403,
    });
  }
};
