const authMiddleware = require(`./authMiddleware`);
const validatorMiddleware = require(`./validatorMiddleware`);
const errorMiddleware = require(`./errorMiddleware`);
const accessMiddleware = require("./accessMiddleware");
const mongooseIdMiddleware = require("./mongooseIdMiddleware");
const refreshTokenMiddleware = require("./refreshTokenMiddleware");
const finalResponseMiddleware = require("./finalResponseMiddleware");
module.exports = {
  authMiddleware,
  validatorMiddleware,
  errorMiddleware,
  accessMiddleware,
  mongooseIdMiddleware,
  refreshTokenMiddleware,
  finalResponseMiddleware,
};
