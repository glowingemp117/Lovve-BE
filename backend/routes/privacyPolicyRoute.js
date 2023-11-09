const express = require("express");
const router = express.Router();

const { getPrivacyPolicy } = require("../controllers/privacyPolicyController");

router.get("/", getPrivacyPolicy);

module.exports = router;
