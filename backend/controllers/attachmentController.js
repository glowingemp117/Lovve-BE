const asyncHandler = require("express-async-handler");
const Attachment = require("../schemas/attachments");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");
const attachments = require("../schemas/attachments");

const addAttachment = asyncHandler(async (req, res) => {
  try {
    // if (!req.files) {
    //   return res.status(400).json({ status: 400, message: "File is required" });
    // }
    const file = req.file;
    // console.log("file----------->", file);
    // console.log("type----------->", req.body.type);
    // return
    // const { name, url, type } = req.body;
    // const filePath = req.file.path;
    const attachment = await Attachment.create({
      name: file.originalname,
      url: file.path.toString(),
      type: req.body.type,
    });

    const completeUrl = process.env.BASE_URL + attachment.url;
    // Create a new object with renamed fields
    const responseData = {
      id: attachment._id, // Rename _id to id
      name: attachment.name,
      url: completeUrl,
      file_storage_path: attachment.url,
      type: attachment.type,
      __v: attachment.__v,
    };

    return successResponse(201, "Uploaded successfully", responseData, res);
  } catch (error) {
    console.error("Error adding attachment:", error);

    res.status(500).json({ status: 400, message: "File is required" });
  }
});

module.exports = {
  addAttachment,
};
