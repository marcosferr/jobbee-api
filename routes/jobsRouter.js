const express = require("express");
const router = express.Router();

// Importing jobs controller methos
const {
  getJobs,
  newJob,
  getJobsInRadius,
  updateJob,
  deleteJob,
} = require("../controllers/jobsController");

router.route("/jobs").get(getJobs);

router.route("/jobs").post(newJob);

router.route("/jobs/:id").put(updateJob).delete(deleteJob);

router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);
module.exports = router;
