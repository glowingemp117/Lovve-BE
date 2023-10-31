const AppError = require("./AppError");
const GeneralErrorsFactory = require("./general");
const UsersErrorsFactory = require("./users");
const MongooseErrorsFactory = require("./mongoose");

module.exports = {
  AppError,
  GeneralErrorsFactory,
  UsersErrorsFactory,
  MongooseErrorsFactory,
};
