import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Unauthorized403 from '../pages/errors/Unauthorized403';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Import Pages (akan dibuat setelah ini)
import KaderDashboard from '../pages/dashboard/KaderDashboard';
import InputTimbangan from '../pages/dashboard/InputTimbangan';
import DokterDashboard from '../pages/dashboard/DokterDashboard';
import StatistikWilayah from '../pages/dashboard/StatistikWilayah';
import OrangTuaDashboard from '../pages/dashboard/OrangTuaDashboard';
import PanduanGizi from '../pages/dashboard/PanduanGizi';
import AdminDashboard from '../pages/dashboard/AdminDashboard';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Error Routes */}
      <Route path="/403-unauthorized" element={<Unauthorized403 />} />

      {/* Kader Routes */}
      <Route element={<ProtectedRoute allowedRoles={['kader']} />}>
        <Route path="/dashboard/kader" element={<DashboardLayout />}>
          <Route index element={<KaderDashboard />} />
          <Route path="input" element={<InputTimbangan />} />
        </Route>
      </Route>

      {/* Dokter Routes */}
      <Route element={<ProtectedRoute allowedRoles={['dokter']} />}>
        <Route path="/dashboard/dokter" element={<DashboardLayout />}>
          <Route index element={<DokterDashboard />} />
          <Route path="statistik" element={<StatistikWilayah />} />
        </Route>
      </Route>

      {/* Orang Tua Routes */}
      <Route element={<ProtectedRoute allowedRoles={['orangtua']} />}>
        <Route path="/dashboard/orangtua" element={<DashboardLayout />}>
          <Route index element={<OrangTuaDashboard />} />
          <Route path="resep" element={<PanduanGizi />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/dashboard/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
