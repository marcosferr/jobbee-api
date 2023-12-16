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
  applyJob,
} = require("../controllers/jobsController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.route("/jobs").get(getJobs);

router
  .route("/jobs/:id/apply")
  .post(isAuthenticatedUser, authorizeRoles("user"), applyJob);

router
  .route("/jobs")
  .post(isAuthenticatedUser, authorizeRoles("employeer", "admin"), newJob);

router.route("/jobs/stats/:topic").get(jobStats);

router.route("/jobs/:id/:slug").get(getJob);

router
  .route("/jobs/:id")
  .put(isAuthenticatedUser, authorizeRoles("employeer", "admin"), updateJob)
  .delete(isAuthenticatedUser, authorizeRoles("employeer", "admin"), deleteJob);

router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);
module.exports = router;
