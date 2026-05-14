import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "@/api/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getToken();
  
  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If there is a token, render the children
  return <>{children}</>;
}
