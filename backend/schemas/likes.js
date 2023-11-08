const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  total: {
    type: Number,
    required: true,
  },
  remaining: {
    type: Number,
    required: true,
  },
  limited: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("likes", likeSchema);
