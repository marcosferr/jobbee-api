const express = require("express");
const router = express.Router();

// Importing jobs controller methos
const {
  getJobs,
  newJob,
  getJobsInRadius,
  updateJob,
  deleteJob,
  getJob,
  jobStats,
} = require("../controllers/jobsController");

router.route("/jobs").get(getJobs);

router.route("/jobs").post(newJob);

router.route("/jobs/stats/:topic").get(jobStats);

router.route("/jobs/:id/:slug").get(getJob);

router.route("/jobs/:id").put(updateJob).delete(deleteJob);

router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);
module.exports = router;
