import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../types/auth";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: JSX.Element;
  roles?: UserRole[];
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
