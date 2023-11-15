const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "subscriptionPlans" },
  is_expired: {
    type: Boolean,
    default: false,
  },
  subscribed_on: {
    type: String,
  },
});

module.exports = mongoose.model("subscriptions", subscriptionSchema);
