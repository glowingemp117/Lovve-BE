const mongoose = require("mongoose");

const profileStatusSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  total_likes: {
    type: Number,
    required: true,
  },
  total_maches: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("profilestatus", profileStatusSchema);
