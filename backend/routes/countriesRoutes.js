const express = require("express");
const router = express.Router();

const { getAllCountries } = require("../controllers/countriesController");

router.get("/", getAllCountries);

module.exports = router;
