const asyncHandler = require("express-async-handler");
const Support = require("../schemas/support");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");

const addSupport = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const newSupportRequest = new Support({ message });
    await newSupportRequest.save(); // Use await to wait for the save operation

    return res
      .status(201)
      .json({ status: 201, message: "Request sent successfully" });
  } catch (error) {
    console.error("Failed to send request:", error);
    return res.status(500).json({ error: "Failed to send request" });
  }
});

module.exports = {
  addSupport,
};
