const ErrorsFactory = require("./errors");
const ResponsesFactory = require("./responses");
const EntitiesFactory = require("./entities");

module.exports = {
  ...ErrorsFactory,
  ...ResponsesFactory,
  ...EntitiesFactory,
};
