import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/store/hook";
import {
  selectIsAuthenticated,
  selectUserRole,
} from "../../features/auth/authSelectors";
import type { UserRole } from "../../features/auth/authTypes";
import { getRedirectPathByRole } from "../../features/auth/authUtils";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRole = useAppSelector(selectUserRole);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={getRedirectPathByRole(userRole)} replace />;
  }

  return <Outlet />;
}