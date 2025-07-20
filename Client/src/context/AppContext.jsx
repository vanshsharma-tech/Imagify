import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [credit, setCredit] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Load credits and user info using Authorization header
  const loadCreditsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setCredit(data.credits);
        setUser(data.user);
      }
    } catch (error) {
      console.log("Load Credits Error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired or unauthorized.");
        logout();
      } else if (error.response?.status === 404) {
        console.warn("Credits route not found.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const generateImage = async (prompt) => {
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/image/generate-image`,
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data.success) {
      loadCreditsData();
      return data.resultImage;
    }
  } catch (error) {
    console.log("Generate Image Error:", error);

    // ✅ Axios puts response errors here
    if (error.response) {
      const { data } = error.response;

      toast.error(data.message || "Image generation failed");

      if (data.creditBalance === 0) {
        navigate("/buy");
      }

      loadCreditsData();
    } else {
      toast.error("Unexpected error occurred");
    }
  } 
};


  // ✅ Logout: Clear localStorage and state
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setCredit(false);
  };

  // ✅ Automatically load data when token exists
  useEffect(() => {
    if (token && token !== "undefined") {
      loadCreditsData();
    }
  }, [token]);

  // ✅ Provide context values globally
  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    token,
    setToken,
    credit,
    setCredit,
    loadCreditsData,
    logout,
    generateImage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
