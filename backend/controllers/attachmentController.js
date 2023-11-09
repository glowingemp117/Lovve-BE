const asyncHandler = require("express-async-handler");
const Attachment = require("../schemas/attachments");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");

const addAttachment = asyncHandler(async (req, res) => {
  try {
    // if (!req.files) {
    //   return res.status(400).json({ status: 400, message: "File is required" });
    // }

    const file = req.file.path.toString();
    // const { name, url, type } = req.body;
    // const filePath = req.file.path;
    await Attachment.create({
      url: file,
      type: req.body.type,
    });

    // const savedAttachment = await attachment.save();
    return successResponse(
      201,
      "Upload successfully",
      // savedAttachment,
      "ok",
      res
    );
  } catch (error) {
    console.error("Error adding attachment:", error);

    res.status(500).json({ status: 400, message: "File is required" });
  }
});

module.exports = {
  addAttachment,
};
