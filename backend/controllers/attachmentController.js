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
    const file = req.file;
    console.log("file----------->", file);
    // const { name, url, type } = req.body;
    // const filePath = req.file.path;
    const attachment = await Attachment.create({
      name: file.originalname,
      url: file.path.toString(),
      type: req.body.type,
    });

    attachment.url = process.env.BASE_URL + attachment.url
    return successResponse(201, "Upload successfully", attachment, res);
  } catch (error) {
    console.error("Error adding attachment:", error);

    res.status(500).json({ status: 400, message: "File is required" });
  }
});

module.exports = {
  addAttachment,
};
