const asyncHandler = require("express-async-handler");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");
const User = require("../schemas/User");
const Subcription = require("../schemas/subscription");
const attachment = require("../schemas/attachments");
const country_id = require("../schemas/country");
const FAQ = require("../schemas/FAQ");
const like = require("../schemas/likes");
const profilestatus = require("../schemas/profile_stats");
const Settings = require("../schemas/AdminSettings");
const PreSignup = require("../schemas/PreSignup");
const Devices = require("../schemas/Devices");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getProfile } = require("../helpers/UserHelper");
const { sendEmail } = require("../middleware/sendEmail");
const { getCode } = require("../helpers/UserHelper");
const { verifyGenerateCode } = require("../helpers/UserHelper");
const mongoose = require("mongoose");

//Love project auth
const addSubscription = asyncHandler(async (req, res) => {
  try {
    const { plan_id } = req.body;
    const userId = req.user._id;

    await verifyrequiredparams(400, req.body, ["plan_id"], res);
    const user = await getProfile(userId);
    if (!user) {
      throw new Error("user not found");
    }

    await Subcription.create({
      user_id: userId,
      plan_id: plan_id,
      is_expired: false,
      subscribed_on: new Date(),
    });

    SuccessWithoutBody(201, "Added successfully", res);

    // else {
    // //   throw new Error("Something Went Wrong while creating user");
    // // }
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

// Get All User Subcription

const getSubcriptions = asyncHandler(async (req, response) => {
  try {
    const subcription = await Subcription.find();
    return successResponse(200, "Fetched successfully", subcription, response);
  } catch (err) {
    return PrintError(403, err.message, [], response, "FORBIDDEN");
  }
});

// Get Login User Subcription

const getLoginUserSubcriptions = asyncHandler(async (req, response) => {
  try {
    const userId = req.user._id;
    const subcription = await Subcription.findOne({ user_id: userId });
    if (!subcription) {
      throw new Error("user not found");
    }
    return successResponse(
      200,
      "Login User Found Successfully",
      subcription,
      response
    );
  } catch (err) {
    return PrintError(403, err.message, [], response, "FORBIDDEN");
  }
});
module.exports = {
  addSubscription,
  getSubcriptions,
  getLoginUserSubcriptions,
};
