const express = require("express");
const router = express.Router();
const {
  registerUser,
  getAllUsers,
  loginUser,
  changePassword,
  logout,
  forgotpassword,
  validatepin,
  resetpassword,
  updateTimeZone,
  preSignupCheck,
  preSignupVerification,
  testSocketio,
  getFaq,
  getPrivacy,
  getTerms,
  getAbout,
  verifyOtp,
  resendOtp,
  deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
router
  .post("/signup", registerUser)
  .post("/login", loginUser)
  .post("/resendOtp", resendOtp)
  .post("/verifyotp", verifyOtp)
  .put("/changepassword", protect, changePassword)
  .delete("/deleteAccount", protect, deleteAccount)
  .post("/logout", protect, logout)
  .put("/forgotpassword", forgotpassword)
  .put("/validatepin", validatepin)
  .put("/resetpassword", resetpassword)
  .put("/timezone", protect, updateTimeZone)
  .post("/signup/pre", preSignupCheck)
  .post("/signup/verify", preSignupVerification)
  .post("/socket", protect, testSocketio)
  .get("/home", getAllUsers)
  .get("/faq", getFaq)
  .get("/privacy", getPrivacy)
  .get("/terms", getTerms)
  .get("/about", getAbout);

module.exports = router;
