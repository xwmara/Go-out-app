import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/store/hook";
import {
  selectIsAuthenticated,
  selectUserRole,
} from "../../features/auth/authSelectors";
import { getRedirectPathByRole } from "../../features/auth/authUtils";

export default function PublicOnlyRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRole = useAppSelector(selectUserRole);

  if (isAuthenticated) {
    return <Navigate to={getRedirectPathByRole(userRole)} replace />;
  }

  return <Outlet />;
}