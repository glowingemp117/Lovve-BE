const { GeneralErrorsFactory } = require("../factories");

module.exports = ({ req, res, next, allowedRoles }) => {
  const user = req.user;

  if (allowedRoles.includes(user.role)) {
    next();
  } else {
    next(GeneralErrorsFactory.invalidAccessErr());
  }
};
