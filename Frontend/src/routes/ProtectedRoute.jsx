import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { decodeToken } from "../utils/jwtUtils"; // Pastikan fungsi decodeToken tersedia

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Dekode token dan ambil role
  const decodedToken = decodeToken(token);
  const userRole = decodedToken?.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
