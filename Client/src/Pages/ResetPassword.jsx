import React, { useState, useRef, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../Components/Context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]); // Initialize `ref`
  const [isEmailSent, setIsEmailSent] = useState("");
  const [resetPasswordOpt, setResetPasswordOpt] = useState(0);
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);
  const handleInput = (e, index) => {
    const value = e.target.value;

    if (value.length === 1) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus(); // Focus next input
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus(); // Focus previous input
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.slice(0, 6).split(""); // Limit to 6 characters
    const updatedOtp = [...otp];

    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        updatedOtp[index] = char;
        inputRefs.current[index].value = char;
      }
    });

    setOtp(updatedOtp);
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSent(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""));
    setIsOtpSubmited(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        alt="Logo"
      />

      {/* Enter Email Form */}

      {!isEmailSent && (
        <form
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
          onSubmit={onSubmitEmail}
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter Your Registered Email address
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="Email Icon" />
            <input
              type="email"
              className="bg-transparent outline-none w-full text-white"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer rounded-full py-2.5">
            Submit
          </button>
        </form>
      )}

      {!isOtpSubmited && isEmailSent && (
        <form
          onSubmit={onSubmitOtp}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your Email id.
          </p>
          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {otp.map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(el) => (inputRefs.current[index] = el)}
                value={otp[index]}
                onChange={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />
            ))}
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r text-[18px] from-indigo-500 to-indigo-900 text-white rounded-md">
            Submit
          </button>
        </form>
      )}

      {/* Enter New Password  */}

      {isOtpSubmited && isEmailSent && (
        <form 
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
          onSubmit={onSubmitNewPassword}
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter Your Registered Email address
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="Lock Icon" />
            <input
              type="password"
              className="bg-transparent  w-full  outline-none placeholder:text-gray-100"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer rounded-full py-2.5">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
