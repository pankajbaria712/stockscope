import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loader"><div className="loader__spinner" /></div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
