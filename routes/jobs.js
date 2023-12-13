const express = require("express");
const router = express.Router();

// Importing jobs controller methos
const { getJobs } = require("../controllers/jobsController");

router.route("/jobs").get(getJobs);

module.exports = router;
