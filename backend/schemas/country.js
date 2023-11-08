const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },
  flag: {
    type: String,
    required: true,
    default: "",
  },
});

module.exports = mongoose.model("countries", countrySchema);
