const router = require("express").Router();
const { addAttachment } = require("../controllers/attachmentController");
const multer = require("multer");
// const storage = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./backend/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("url"), addAttachment);

module.exports = router;
