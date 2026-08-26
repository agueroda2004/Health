import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "../../../app/LoadingScreen";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isInitialized, session } = useAuth();
  if (!isInitialized) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}