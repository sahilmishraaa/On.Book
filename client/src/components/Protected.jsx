import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Protected({ children, creator = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (creator && !["creator", "admin"].includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}
