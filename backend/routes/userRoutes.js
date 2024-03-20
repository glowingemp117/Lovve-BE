const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  changePassword,
  logout,
  forgotpassword,
  validatepin,
  approveUser,
  resetpassword,
  updateTimeZone,
  preSignupCheck,
  preSignupVerification,
  getFaq,
  getPrivacy,
  getTerms,
  getAbout,
  verifyOtp,
  resendOtp,
  deleteAccount,
  getLoginProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
router
  .post("/signup", registerUser)
  .post("/login", loginUser)
  .post("/resendOtp", resendOtp)
  .post("/verifyOtp", verifyOtp)
  .put("/changepassword", protect, changePassword)
  .delete("/deleteAccount", protect, deleteAccount)
  .post("/logout", protect, logout)
  .put("/forgotpassword", forgotpassword)
  .put("/validatepin", validatepin)
  .put("/approveUser", protect, approveUser)
  .put("/resetpassword", resetpassword)
  .put("/timezone", protect, updateTimeZone)
  .post("/signup/pre", preSignupCheck)
  .post("/signup/verify", preSignupVerification)
  .get("/me", protect, getLoginProfile)
  .get("/faq", getFaq)
  .get("/privacy", getPrivacy)
  .get("/terms", getTerms)
  .get("/about", getAbout);

module.exports = router;
