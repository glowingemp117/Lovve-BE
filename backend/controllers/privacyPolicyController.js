const asyncHandler = require("express-async-handler");
const PrivacyPolicy = require("../schemas/privacyPolicy");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");

const getPrivacyPolicy = asyncHandler(async (req, res) => {
  const privacyPolicy = await PrivacyPolicy.findOne();

  // If the privacy policy document does not exist, create a new one
  if (!privacyPolicy) {
    const newPrivacyPolicy = new PrivacyPolicy({
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
    });

    await newPrivacyPolicy.save();

    // Return the response in the desired format
    return res.status(200).json({
      status: 200,
      message: "Fetched successfully",
      data: newPrivacyPolicy.content,
    });
  }

  // Return the response in the desired format
  return res.status(200).json({
    status: 200,
    message: "Fetched successfully",
    data: privacyPolicy.content,
  });
});

module.exports = {
  getPrivacyPolicy,
};
