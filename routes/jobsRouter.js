const express = require("express");
const router = express.Router();

// Importing jobs controller methos
const { getJobs, newJob } = require("../controllers/jobsController");

router.route("/jobs").get(getJobs);

router.route("/jobs").post(newJob);
module.exports = router;
