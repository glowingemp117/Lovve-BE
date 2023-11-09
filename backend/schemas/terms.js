const mongoose = require("mongoose");

const termsSchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model("terms", termsSchema);
