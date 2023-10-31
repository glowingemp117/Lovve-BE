// error Middleware
const { AppError } = require("../factories");

module.exports = (data, req, res, next) => {
  if (!(data instanceof AppError)) return next(data);

  data.statusCode = data.statusCode || 500;
  data.status = data.status ?? "error";
  // TODO: Add proper logger solution here like sentry
  if (data.internalErr) console.dir(data.internalErr, { depth: null });
  data.message =
    data.statusCode === 500 ? "Something went wrong" : data.message;

  const errData = {
    statusCode: data.statusCode,
    message: data.message,
  };

  return next(errData);
};
