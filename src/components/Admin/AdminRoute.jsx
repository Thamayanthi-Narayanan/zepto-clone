import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  // Check if user is admin
  const userRole = localStorage.getItem('userRole');
  const adminToken = localStorage.getItem('adminToken');

  // If not admin or no token, redirect to admin login
  if (userRole !== 'admin' || !adminToken || adminToken.trim() === '') {
    return <Navigate to="/admin/login" replace />;
  }

  // If admin, show the protected content
  return children;
}

