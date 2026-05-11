import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // only block when we KNOW auth is invalid
  if (user === null) return <Navigate to="/" replace />;

  return children;
}