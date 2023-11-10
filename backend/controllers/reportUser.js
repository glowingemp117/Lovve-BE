const asyncHandler = require("express-async-handler");
const Report = require("../schemas/reportUser");
const User = require("../schemas/User");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");

const reportUser = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const reportTo = req.query.id;

    console.log(reportTo);

    // Check if both users exist
    const reporterUser = await User.findById(_id);
    const reportedUser = await User.findById(reportTo);

    if (!reporterUser || !reportedUser) {
      return res.status(404).json({ message: "Users not found" });
    }

    // Create a report
    const newReport = new Report({
      reportBy: _id,
      reportTo: reportTo,
    });

    await newReport.save();

    res
      .status(201)
      .json({ status: 201, message: "User reported successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  reportUser,
};
