const mongoose = require("mongoose");

const privacySchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model("privacypolicy", privacySchema);
