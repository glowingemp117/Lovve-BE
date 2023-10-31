const AppError = require("./AppError");

module.exports = class MongooseErrorsFactory {
  constructor() {}

  static invalidObjectId() {
    return new AppError({
      message: "Please enter a valid id",
      statusCode: 400,
    });
  }
};
