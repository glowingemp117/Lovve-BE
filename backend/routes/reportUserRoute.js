const express = require("express");
const router = express.Router();
const { reportUser } = require("../controllers/reportUser"); // Import the controller
const { protect } = require("../middleware/authMiddleware");

// Add a like
router.post("/reportUser", protect, reportUser);

module.exports = router;
