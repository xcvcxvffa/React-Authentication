const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { transporter } = require("../Config/nodemailer");
const {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} = require("../Config/emailTemplates");

const register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.json({
      success: false,
      message: "Please fill all the fields!!!!",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 3600000 * 24 * 7,
    });

    // sending welcome Mail
    const mailOption = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Welcome To Our Site",
      html: `<h1>Welcome To Our Site</h1><p>Welcome to MernAuth Site. Your account has been created with email id: ${email}</p>`,
    };
    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please fill all the fields",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 3600000 * 24 * 7,
    });
    return res.json({ success: true, message: "User logged in successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Your account is already verified",
      });
    }

    // Generate a 6-digit OTP
    const verifyOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

    // Set OTP and expiration
    user.verifyOtp = verifyOtp;
    user.verifyOtpExpireAt = verifyOtpExpireAt;
    await user.save();

    // Email configuration
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify Your Account",
      // text: `Your verification OTP is ${verifyOtp}. It will expire in 10 minutes.`,

      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", verifyOtp).replace(
        "{{email}}",
        user.email
      ),
    };

    await transporter.sendMail(mailOption);

    res.json({
      success: true,
      message: "Email verification OTP sent to your email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Mark account as verified
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.json({
      success: true,
      message: "Email is verified successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch {
    res.json({ success: false, message: error.message });
  }
};

const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "No user found with this email",
      });
    }

    // Generate a 6-digit OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Save the OTP and its expiration to the user's record
    user.resetOtp = resetOtp;
    user.resetOtpExpireAt = resetOtpExpireAt;
    await user.save();

    // Email configuration
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      // text: `Your password reset OTP is ${resetOtp}. It will expire in 10 minutes.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", resetOtp).replace(
        "{{email}}",
        user.email
      ),
    };

    // Send the email
    await transporter.sendMail(mailOption);

    res.json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.json({
        success: false,
        message:
          "Missing details. Please provide email, OTP, and new password.",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "No user found with this email.",
      });
    }

    // Check if OTP matches
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Check if OTP has expired
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    user.resetOtp = ""; // Clear the OTP
    user.resetOtpExpireAt = 0; // Clear the expiration
    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  isAuthenticated,
  resetPassword,
};
