const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updatePassword,
  updateProfile,
  deleteProfile,
  getAppliedJobs,
  getMyJobs,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/me/delete").delete(isAuthenticatedUser, deleteProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/jobs/applied").get(isAuthenticatedUser, getAppliedJobs);
router.route("/me/jobs/").get(isAuthenticatedUser, getMyJobs);
router.route("/admin/users").get(isAuthenticatedUser, getAllUsers);
router.route("/admin/users/:id").delete(isAuthenticatedUser, deleteUser);
module.exports = router;
