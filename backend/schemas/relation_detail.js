const mongoose = require("mongoose");

const relationSchema = new mongoose.Schema({
  likedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  likedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  matched: {
    type: Boolean,

    default: false,
  },
  liked: {
    type: Boolean,

    default: false,
  },
  visited: {
    type: Boolean,

    default: false,
  },
});

module.exports = mongoose.model("relationDetail", relationSchema);
