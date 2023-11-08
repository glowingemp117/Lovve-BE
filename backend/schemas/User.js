const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, default: "" },
    age: { type: Number, default: "0" },
    country: { type: mongoose.Schema.Types.ObjectId, ref: "countries" },
    gender: { type: String, default: "" },
    selfie_id: { type: String, default: "" },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "attachments" }],
    fcm_token: { type: String, default: "" },
    device_type: { type: String, default: "" },
    timezone: { type: String, default: "" },
    user_type: { type: Number, default: 1 },
    otp: { type: Number },
    device_id: { type: String, default: "" },
    new_user: { type: Boolean, default: false },
    bio: { type: String, maxlength: 15 },
    isVerify: { type: Boolean, default: false },
    // Define otpAttempts as part of the user schema
    otpAttempts: {
      type: Number,
      default: 0, // Initialize the count to 0
    },

    // You can also define other properties like lastFailedAttempt and retryTimestamp here
    lastFailedAttempt: {
      type: Date,
      default: null, // Initialize to null
    },
    retryTimestamp: {
      type: Date,
      default: null, // Initialize to null
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", UserSchema);
