const mongoose = require("mongoose");

const AttchmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  name: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    // required: true,
    default: "",
  },
  type: {
    type: String,
    // required: true,
    default: "",
  },
});

module.exports = mongoose.model("attachments", AttchmentSchema);
