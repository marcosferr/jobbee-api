const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFilters = require("../utils/apiFilters");
// Get all jobs  => /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagination();
  const jobs = await apiFilters.query;
  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

// Get a single job with id and slug =>  /api/v1/job/:id/:slug
exports.getJob = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.findOne({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });
  if (!job) {
    return next(new ErrorHandler(404, "Job not found"));
  }
  res.status(200).json({
    success: true,
    data: job,
  });
});

// Create a new Job => /api/v1/jobs

exports.newJob = catchAsyncErrors(async (req, res, next) => {
  //adding user to body
  req.body.user = req.user.id;
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job Created.",
    data: job,
  });
});

//Update a job => /api/v1/jobs/:id
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler(404, "Job not found"));
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
});

//Delete a job  => /api/v1/job/:id

exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorHandler(400, "Invalid Job ID"));
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
    return next(new ErrorHandler(404, "Job not found"));
  }
  res.status(200).json({
    success: true,
    message: "Job was deleted successfully",
  });
});

// Search jobs with radios => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
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
});

// Get stats about a topic(job) => /api/v1/stats/:topic

exports.jobStats = catchAsyncErrors(async (req, res, next) => {
  let stats = await Job.aggregate([
    {
      $match: { $text: { $search: '"' + req.params.topic + '"' } },
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
      },
    },
  ]);

  if (stats.length === 0) {
    return next(
      new ErrorHandler(404, `No stats found for ${req.params.topic}`)
    );
  }
  res.status(200).json({
    success: true,
    data: stats,
  });
});
