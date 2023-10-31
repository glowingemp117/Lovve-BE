// Refresh Token
const config = require("config");
const { UsersModel } = require("../models");
const { AppError } = require("../factories");

module.exports = (data, req, res, next) => {
  if (data instanceof AppError) return next(data);

  const jwtData = req.user;
  let dataForToken = {};

  if (jwtData) {
    dataForToken = {
      id: jwtData.id,
      role: jwtData.role,
    };
  } else {
    dataForToken = {
      id: data.data.id,
      role: data.data.role,
    };
  }

  const token = UsersModel.generateAuthToken({
    id: dataForToken.id,
    role: dataForToken.role,
  });

  let headers = {
    [config.get("tokenVariable")]: token,
  };

  res.set(headers);

  return next(data);
};
