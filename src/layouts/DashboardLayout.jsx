import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import {
  Baby,
  Scale,
  Stethoscope,
  UserCog,
  LogOut,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Menu,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, userRole, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const getSidebarLinks = () => {
    switch (userRole) {
      case 'kader':
        return [
          { name: 'Data Balita', path: '/dashboard/kader', icon: Baby },
          { name: 'Input Timbangan', path: '/dashboard/kader/input', icon: Scale },
        ];
      case 'dokter':
        return [
          { name: 'Antrean Validasi', path: '/dashboard/dokter', icon: Stethoscope },
          { name: 'Statistik Wilayah', path: '/dashboard/dokter/statistik', icon: TrendingUp },
        ];
      case 'orangtua':
        return [
          { name: 'Perkembangan Anak', path: '/dashboard/orangtua', icon: TrendingUp },
          { name: 'Panduan Gizi', path: '/dashboard/orangtua/resep', icon: BookOpen },
        ];
      case 'admin':
        return [
          { name: 'Manajemen Pengguna', path: '/dashboard/admin', icon: UserCog },
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks();
  const activeLink = links.find((link) => location.pathname === link.path);
  const userInitials = user?.username?.substring(0, 2).toUpperCase() || 'U';

  const roleLabelMap = {
    kader: 'Kader Posyandu',
    dokter: 'Dokter Puskesmas',
    orangtua: 'Orang Tua Balita',
    admin: 'Administrator',
  };

  return (
    <div className="dashboard-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dashboard-brand">
          <div className="brand-row">
            <div className="brand-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L12 22M2 12L22 12" />
              </svg>
            </div>
            <div>
              <div className="brand-title">Tumbang.id</div>
              <div className="brand-subtitle">Posyandu Growth System</div>
            </div>
          </div>
        </div>

        <nav className="dashboard-nav">
          <div className="nav-section-label">Menu Utama</div>
          {links.map((link, i) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={`${link.name}-${i}`}
                to={link.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} className="link-icon" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="dashboard-user-card">
            <div className="avatar-soft">{userInitials}</div>
            <div className="user-meta">
              <div className="user-meta-name">{user?.username}</div>
              <div className="user-meta-role">{roleLabelMap[userRole] || userRole}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-link-logout"
            style={{ width: '100%', background: 'none', border: 'none' }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            Keluar
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn-mobile-menu"
              aria-label="Buka menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="breadcrumb-pill">
              <span>{roleLabelMap[userRole] || userRole}</span>
              <ChevronRight size={14} color="#cbd5e1" />
              <span className="breadcrumb-current">{activeLink?.name || 'Dashboard'}</span>
            </div>
          </div>

          <div className="topbar-right">
            <span className="role-chip">{roleLabelMap[userRole] || userRole}</span>
            <div className="avatar-soft">{userInitials}</div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
