import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("session");
  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
