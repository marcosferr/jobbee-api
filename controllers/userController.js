const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const fs = require("fs");
const path = require("path");
const Job = require("../models/jobs");
const APIFilters = require("../utils/apiFilters");
// Get current user profile => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("jobs");
  console.log(user);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update / Change password => /api/v1/password/update

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  //Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler(400, "Old password is incorrect"));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// Update user profile => /api/v1/me/update

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    data: newUserData,
  });
});

// Delete user profile => /api/v1/me/delete

exports.deleteProfile = catchAsyncErrors(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Your account has been deleted",
  });
});

async function deleteUserData(user, role) {
  if (role === "employeer") {
    await Job.deleteMany({ user: user });
  }
  if (role === "user") {
    const appliedJobs = await Job.find({ "applicantsApplied.id": user }).select(
      "+applicantsApplied"
    );
    appliedJobs.forEach(async (job) => {
      job.applicantsApplied = job.applicantsApplied.filter(
        (applicant) => applicant.id !== user
      );
      await job.save();
    });
    let directoryPath = path.join(__dirname, "../public/uploads/jobs", user);
    fs.readdir(directoryPath, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        if (file.startsWith("resume_") && file.endsWith(".pdf")) {
          fs.unlink(path.join(directoryPath, file), (err) => {
            if (err) throw err;
            console.log(`${file} deleted successfully`);
          });
        }
      });
    });
  }
}
//Adding controller methods that are only accesible to admin
// Get all users => /api/v1/admin/users

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagination();
  const users = await apiFilters.query;

  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});
// Delete a user => /api/v1/admin/user/:id

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(404, `User not found with id: ${req.params.id}`)
    );
  }
  await deleteUserData(user._id, user.role);
  await user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Show all aplied jobs => /api/v1/me/applied

exports.getAppliedJobs = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+appliedJobs");
  const appliedJobs = await Job.find({ "applicantsApplied.id": user._id });
  res.status(200).json({
    success: true,
    data: appliedJobs,
  });
});

// Get all jobs created by user => /api/v1/me/jobs

exports.getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ user: req.user.id });
  res.status(200).json({
    success: true,
    data: jobs,
  });
});
