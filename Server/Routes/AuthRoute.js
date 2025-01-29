const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  sendVerifyOtp,
  
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} = require("../Controllers/authController");
const userAuth = require("../Middlewares/userAuth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-Account", userAuth, verifyEmail);
router.get("/is-auth", userAuth, isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
