const express = require("express");
const router = express.Router();
const { addLike } = require("../controllers/profileLiked"); // Import the controller
const { protect } = require("../middleware/authMiddleware");

// Add a like
router.post("/addLike", protect, addLike);

module.exports = router;
