const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("support", supportSchema);
