import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { UserRole } from "../services/api";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: UserRole[];
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
}
