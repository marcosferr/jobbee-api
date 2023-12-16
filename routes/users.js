const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updatePassword,
  updateProfile,
  deleteProfile,
} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/me/delete").delete(isAuthenticatedUser, deleteProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

module.exports = router;
