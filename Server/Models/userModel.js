const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpireAt: {
      type: Number,
      default: 0,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpireAt: {
      type: Date,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model.user || mongoose.model("User", userSchema);

module.exports = User;
