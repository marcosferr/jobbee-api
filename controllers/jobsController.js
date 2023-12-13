const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const mongoose = require("mongoose");
// Get all jobs  => /api/v1/jobs
exports.getJobs = async (req, res, next) => {
  const jobs = await Job.find();
  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
};

// Create a new Job => /api/v1/jobs

exports.newJob = async (req, res, next) => {
  const job = await Job.create(req.body);
  res.status(200).json({
    success: true,
    message: "Job Created.",
    data: job,
  });
};

//Update a job => /api/v1/jobs/:id
exports.updateJob = async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "Job is updated",
    data: job,
  });
};

//Delete a job  => /api/v1/job/:id

exports.deleteJob = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Job ID",
    });
  }

  let job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Job was deleted successfully",
  });
};

// Search jobs with radios => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Getting latitude and longitude from geocoder with zipcode
  const loc = await geoCoder.geocode(zipcode);
  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  //calculation of radius of earth in miles
  const radius = distance / 3963;

  const jobs = await Job.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius],
      },
    },
  });
  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
};
