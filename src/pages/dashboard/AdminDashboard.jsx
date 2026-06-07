import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { authService } from '../../services/apiServices';
import { UserPlus, Power, Users, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dokter');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil daftar pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username dan password wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      await authService.register({ username, password, role });
      toast.success(`Akun ${role} berhasil dibuat`);
      setUsername('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Gagal membuat akun');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, username, currentStatus) => {
    try {
      toast.loading('Mengubah status...', { id: 'status-toast' });
      const response = await api.put(`/api/auth/users/${userId}/toggle-status`);
      toast.success(response.data?.message || 'Status berhasil diubah', { id: 'status-toast' });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengubah status pengguna', { id: 'status-toast' });
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      Admin: 'badge-purple',
      Dokter: 'badge-blue',
      Kader: 'badge-green',
      'Orang Tua': 'badge-amber',
    };
    return map[role] || 'badge-gray';
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle="Registrasi personel baru dan kontrol akses akun sistem"
      />

      <div className="grid-admin">
        <div className="card">
          <div className="card-section-title">
            <div className="icon-circle icon-circle-green" style={{ width: '32px', height: '32px' }}>
              <UserPlus size={16} />
            </div>
            Buat Akun Baru
          </div>

          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="field-input"
                placeholder="Username akun"
              />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="Password"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="field-label">Peran (Role)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="field-input"
              >
                <option value="Dokter">Dokter Puskesmas</option>
                <option value="Kader">Kader Posyandu</option>
                <option value="Orang Tua">Orang Tua Balita</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? 'Memproses...' : 'Buat Akun Resmi'}
            </button>
          </form>
        </div>

        <div className="card card-flush">
          <div className="card-header">
            <Users size={16} color="#94a3b8" />
            <span className="card-header-title">Daftar Pengguna ({users.length})</span>
          </div>

          {loading ? (
            <TableSkeleton rows={6} columns={4} />
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={24} color="#cbd5e1" /></div>
              <p>Belum ada user terdaftar.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const activeStatus = user.is_active !== false;
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-row">
                            <div className="user-avatar user-avatar-gray">
                              {user.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="user-name">{user.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '12.5px', fontWeight: '600',
                            color: activeStatus ? '#16a34a' : '#dc2626',
                          }}>
                            {activeStatus ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {activeStatus ? 'Aktif' : 'Nonaktif'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleToggleStatus(user.id, user.username, activeStatus)}
                            className={activeStatus ? 'btn-danger btn-icon' : 'btn-icon btn-green'}
                          >
                            <Power size={12} />
                            {activeStatus ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
