import { Navigate } from "react-router-dom";

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("session");
  if (token && !isTokenExpired(token)) {
    return children;
  } else {
    alert("Session expired or not logged in. Please login again.");
    localStorage.clear();
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
