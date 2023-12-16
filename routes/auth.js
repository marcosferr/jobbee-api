const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middlewares/auth");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/authController");
router.route("/password/reset/:token").put(resetPassword);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/reset").post(forgotPassword);
router.route("/logout").get(isAuthenticatedUser, logout);
module.exports = router;
