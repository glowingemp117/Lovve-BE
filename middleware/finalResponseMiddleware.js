// Final Response Middleware
module.exports = (data, req, res, next) => {
  const existingHeaders = res.getHeaders();
  const finalHeaders = {
    ...existingHeaders,
    "Content-Type": "application/json",
  };
  return res.status(data.statusCode).set(finalHeaders).json(data);
};
