const mongoose = require("mongoose");

const { usersSchema: reqSchema } = require("../schemas");
const { jwtUtils, validatorUtils } = require("../utils");
const { usersConstants } = require("../constants");

const Schema = mongoose.Schema;

const usersSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "User must have a email"],
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: 6,
      maxlength: 2048,
    },

    countryId: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.keys(usersConstants.roles),
      default: usersConstants.roles.admin.value,
      required: [true, "User must have a role"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

usersSchema.methods = {};

usersSchema.statics = {
  validateCreateRequest: function (user) {
    const schema = reqSchema.create();
    return validatorUtils.validate(schema, user);
  },
  validateLoginRequest: function (user) {
    const schema = reqSchema.login();
    return validatorUtils.validate(schema, user);
  },
  generateAuthToken: function ({ id, role }) {
    const token = jwtUtils.sign({
      id,
      role,
    });
    return token;
  },
  verifyAuthToken: function ({ token }) {
    const decodeObj = jwtUtils.verify(token);
    return decodeObj;
  },
};

module.exports = mongoose.model("Users", usersSchema);
