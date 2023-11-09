const express = require("express");
const router = express.Router();

const { getTerms } = require("../controllers/termsController");

router.get("/", getTerms);

module.exports = router;
