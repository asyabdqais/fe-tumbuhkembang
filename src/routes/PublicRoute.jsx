import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

const PublicRoute = () => {
  const { isAuthenticated, userRole } = useAuthStore();

  if (isAuthenticated) {
    if (userRole === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (userRole === 'dokter') return <Navigate to="/dashboard/dokter" replace />;
    if (userRole === 'kader') return <Navigate to="/dashboard/kader" replace />;
    if (userRole === 'orangtua') return <Navigate to="/dashboard/orangtua" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
