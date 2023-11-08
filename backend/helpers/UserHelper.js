const User = require("../schemas/User");
const like = require("../schemas/likes");
const profilestatus = require("../schemas/profile_stats");

const getCode = async () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const verifyGenerateCode = async () => {
  const OTP_LENGTH = process.env.OTP_LENGTH;
  try {
    const characters = "0123456789";
    let verificationCode = "";

    for (let i = 0; i < OTP_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      verificationCode += characters[randomIndex];
    }

    return verificationCode;
  } catch (err) {
    console.error("Error generating verification code:", err);
    throw err; // Rethrow the error so it can be caught by the caller
  }
};

const getProfile = async (user_id) => {
  try {
    const user = await User.findById(user_id)
      .populate("attachments")
      .populate("country");
    // .populate("likes")
    // .populate("profilestatuses");
    if (!user) {
      throw new Error("Invalid user_id found");
    } else {
      // return user._doc;
      const userProfile = user._doc;

      // Aggregate profilestatus data
      userProfile.profilestatus = await profilestatus.findOne({
        user_id: user_id,
      });

      // Aggregate like data
      userProfile.like = await like.findOne({ user_id: user_id });

      return userProfile;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { getCode, getProfile, verifyGenerateCode };
