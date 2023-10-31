const jwt = require("jsonwebtoken");
const config = require("config");

module.exports.sign = (obj) => {
  const token = jwt.sign(obj, config.get("jwtPrivateKey"), { expiresIn: "1d" });
  return token;
};

module.exports.verify = (token) => {
  try {
    const decodedObj = jwt.verify(token, config.get("jwtPrivateKey"));
    return decodedObj;
  } catch (err) {
    return false;
  }
};
