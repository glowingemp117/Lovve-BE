const mongoose = require("mongoose");
const { MongooseErrorsFactory } = require("../factories");

module.exports = (req, res, next) => {
  const id = req.params.id;
  if (mongoose.isValidObjectId(id)) {
    next();
  } else {
    return next(MongooseErrorsFactory.invalidObjectId());
  }
};
