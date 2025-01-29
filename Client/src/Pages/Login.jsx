import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../Components/Context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);
  const [isSignUp, setIsSignUp] = useState(true);
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        alt="Logo"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl capitalize font-semibold text-white text-center mb-3">
          {isSignUp ? "Create Account" : "Login"}
        </h2>
        <form onSubmit={onSubmitHandler}>
          {isSignUp && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="Person Icon" />
              <input
                type="text"
                className="bg-transparent w-full outline-none placeholder:text-gray-100"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="Email Icon" />
            <input
              type="email"
              className="bg-transparent w-full outline-none placeholder:text-gray-100"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="Lock Icon" />
            <input
              type="password"
              className="bg-transparent  w-full  outline-none placeholder:text-gray-100"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <p
            className="mb-4 text-indigo-500 cursor-pointer"
            onClick={() => navigate("/reset-password")}
          >
            Forgot Password?
          </p>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer rounded-full py-2.5"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="text-gray-400 text-center text-xs mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => {
              setIsSignUp(!isSignUp);
              setState(isSignUp ? "Login" : "Sign Up");
            }}
            className="text-blue-400 cursor-pointer underline"
          >
            {isSignUp ? "Login here" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
