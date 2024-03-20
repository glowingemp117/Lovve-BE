const express = require("express");
const router = express.Router();
const {
  getUserById,
  getAllUsers,
  testSocketio,
  profileUpdate,
  updateConfiguration,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
router
  .post("/socket", protect, testSocketio)
  .patch("/updateConfiguration", protect, updateConfiguration)
  .put("/profileUpdate", protect, profileUpdate)
  .get("/profile", protect, getUserById)
  .get("/home", protect, getAllUsers)
  

module.exports = router;
