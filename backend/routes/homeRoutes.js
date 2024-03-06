const express = require("express");
const router = express.Router();
const {
  getAllUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
router

  .get("/home",protect, getAllUsers)

module.exports = router;
