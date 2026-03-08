import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../components/layout/userContext.tsx";

export default function AdminGuard() {
  const { user } = useUser();
  const location = useLocation();
  const isAdmin = user?.role?.name === 'admin';
  const isActive = user?.is_active;
  if (!isActive) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <Outlet />;
}
