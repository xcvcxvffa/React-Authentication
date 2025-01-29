import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  axios.defaults.withCredentials = true;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data");
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  useEffect(() => {
    if (isLoggedin) {
      getUserData();
    }
  }, [isLoggedin]);

  const value = {
    backendUrl,
    isLoggedin,
    userData,
    getUserData,
    setIsLoggedin,
    setUserData,
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};
