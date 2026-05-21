import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Проверка авторизации
  const checkAuth = useCallback(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const isExpired = payload.exp * 1000 < Date.now();
        if (!isExpired) {
          setIsLoggedIn(true);
          setUserRole(payload.role || "ATHLETE");
          setUserData(payload);
          return true;
        } else {
          return refreshToken();
        }
      } catch (e) {
        console.error("Error parsing token");
      }
    }
    setIsLoggedIn(false);
    setUserRole(null);
    setUserData(null);
    return false;
  }, []);

  const refreshToken = async () => {
    const refreshTokenValue = sessionStorage.getItem("refreshToken");
    if (!refreshTokenValue) {
      logout();
      return false;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("accessToken", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);
        checkAuth();
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      logout();
      return false;
    }
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUserRole(null);
    setUserData(null);

    // Отправляем запрос на сервер для логаута
    const refreshTokenValue = sessionStorage.getItem("refreshToken");
    if (refreshTokenValue) {
      fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      }).catch(console.error);
    }
  }, []);

  const triggerUpdate = useCallback(() => {
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!initialized) {
      checkAuth();
      setInitialized(true);
    }
  }, [initialized, checkAuth]);

  useEffect(() => {
    window.addEventListener("authChange", checkAuth);
    window.addEventListener("profileUpdate", triggerUpdate);
    window.addEventListener("trainingUpdate", triggerUpdate);
    window.addEventListener("achievementUpdate", triggerUpdate);

    return () => {
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("profileUpdate", triggerUpdate);
      window.removeEventListener("trainingUpdate", triggerUpdate);
      window.removeEventListener("achievementUpdate", triggerUpdate);
    };
  }, [checkAuth, triggerUpdate]);

  const value = {
    isLoggedIn,
    userRole,
    userData,
    updateTrigger,
    checkAuth,
    logout,
    triggerUpdate,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
