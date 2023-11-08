const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addAttachment } = require("../controllers/attachmentController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("url"), addAttachment);

module.exports = router;
