const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFilters = require("../utils/apiFilters");
const path = require("path");
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
  console.log(job.user);
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

// Apply for a job using Resume => /api/v1/job/:id/apply
exports.applyJob = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id).select("+applicantsApplied");
  if (!job) {
    return next(new ErrorHandler(404, "Job not found"));
  }
  //Check if job last date
  if (job.lastDate < Date.now()) {
    return next(new ErrorHandler(400, "Job has been expired"));
  }

  // Check if user has already applied for this job
  if (req.user && req.user.id) {
    const hasAlreadyApplied = job.applicantsApplied.some(
      (applicant) => applicant == req.user.id.toString()
    );

    if (hasAlreadyApplied) {
      return next(
        new ErrorHandler(400, "You have already applied for this job")
      );
    }
  }

  const file = req.files.file;
  //Check file type
  const supportedFiles = /pdf|doc|docx/;
  if (!supportedFiles.test(file.mimetype)) {
    return next(new ErrorHandler(400, "Please upload a valid resume"));
  }

  //Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorHandler(
        400,
        `Please upload a resume less than ${process.env.MAX_FILE_UPLOAD}`
      )
    );
  }

  //Create custom file name
  file.name = `resume_${req.user.id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.UPLOAD_PATH}/jobs/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorHandler(500, "Problem with uploading resume"));
    }
  });

  await Job.findByIdAndUpdate(req.params.id, {
    $push: { applicantsApplied: req.user.id },
  });
  res.status(200).json({
    success: true,
    message: "You have successfully applied for this job",
  });
});
