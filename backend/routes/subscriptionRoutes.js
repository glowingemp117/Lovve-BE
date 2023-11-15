const express = require("express");
const router = express.Router();
const {
  getSubcriptions,
  addSubscription,
  getLoginUserSubcriptions,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");
router
  .get("/subscriptions", getSubcriptions)
  .get("/userSubscription", protect, getLoginUserSubcriptions)
  .post("/addSubscription", protect, addSubscription);

module.exports = router;
