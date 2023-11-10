const express = require("express");
const router = express.Router();
const {
  addLike,
  getLike,
  getVisitor,
  getMatches,
  getMatched,
  addVisted,
  createMatch,
} = require("../controllers/profileLiked"); // Import the controller
const { protect } = require("../middleware/authMiddleware");

// Add a like
router.post("/addLike", protect, addLike);
router.post("/addVisit", protect, addVisted);
router.get("/likes", protect, getLike);
router.get("/visitors", protect, getVisitor);
router.get("/matches", protect, getMatches);
router.get("/matchDetail", protect, getMatched);
router.post("/createMatch", protect, createMatch);

module.exports = router;
