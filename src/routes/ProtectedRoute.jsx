import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { createLogger } from "../util/logger";
// import AlertModal from "../components/AlertModal";

const logger = createLogger("ProtectedRoute");
// const [showAlert, setShowAlert] = useState(false);

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    logger.error("Token parsing failed", e);
    return true;
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("session");
  if (token && !isTokenExpired(token)) {
    logger.debug("Route access granted", { path: location.pathname });
    return children;
  } else {
    logger.warn("Route access denied", {
      path: location.pathname,
      reason: token ? "expired" : "missing",
    });
    alert("Session expired or not logged in. Please login again.");
    // <AlertModal
    //   show={showAlert}
    //   message={"Session expired or not logged in. Please login again."}
    //   onClose={() => setShowAlert(false)}
    //   showActions={false}
    //   type="danger"
    // />;
    localStorage.clear();
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
