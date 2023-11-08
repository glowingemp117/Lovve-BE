const express = require("express");
const router = express.Router();

const { addSupport } = require("../controllers/supportController");

router.post("/", addSupport);

module.exports = router;
