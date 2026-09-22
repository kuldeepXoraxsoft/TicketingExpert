import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

type ProtectedRouteProps = {
  roles?: UserRole[];
  children?: ReactNode;
};

export default function ProtectedRoute({
  roles,
  children,
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  if (roles && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/not-found" replace />;
  }

  if (!children) {
    return <Outlet />;
  }

  return <>{children}</>;
}