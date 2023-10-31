const Yup = require("yup");

const { usersConstants } = require("../constants");

module.exports.create = () => {
  const schema = Yup.object().shape({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().min(6).max(255).required("Password is required"),
    role: Yup.string().oneOf(Object.keys(usersConstants.roles)),
  });
  return schema;
};

module.exports.login = () => {
  const schema = Yup.object().shape({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().min(6).max(255).required("Password is required"),
  });

  return schema;
};
