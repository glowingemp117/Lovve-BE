const { GeneralErrorsFactory } = require("../factories");

module.exports = async (req, res, next, validateFunction) => {
  try {
    const { errors } = await validateFunction;
    if (errors) {
      next(GeneralErrorsFactory.badRequestErr({ customMessage: errors }));
    }
    next();
  } catch (err) {
    res.status(500).send(err);
  }
};
