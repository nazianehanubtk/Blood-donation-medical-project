const express = require("express");

const router = express.Router();

const { getAvailableDonors } = require("../controllers/donorController");

router.get("/", getAvailableDonors);

module.exports = router;