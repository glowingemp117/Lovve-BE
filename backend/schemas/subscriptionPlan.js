const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("subscriptionPlans", subscriptionPlanSchema);
