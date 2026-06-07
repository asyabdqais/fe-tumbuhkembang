import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username || !password) {
      setErrorMsg('Username dan password harus diisi');
      return;
    }

    try {
      const redirectPath = await login(username, password);
      toast.success('Login berhasil! Selamat datang.');
      navigate(`/dashboard/${redirectPath}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Gagal login. Hubungi administrator.');
      toast.error('Login gagal');
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px',
          background: 'rgba(34,197,94,0.12)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '240px', height: '240px',
          background: 'rgba(21,128,61,0.08)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: '#16a34a',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L12 22M2 12L22 12" />
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#15803d', letterSpacing: '-0.02em' }}>
              tumbang<span style={{ color: '#16a34a' }}>.</span>
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: '800',
            color: '#14532d', lineHeight: 1.2,
            margin: '0 0 14px',
            letterSpacing: '-0.03em',
          }}>
            Presisi dalam<br />Pertumbuhan
          </h1>
          <p style={{
            fontSize: '13.5px', color: '#166534',
            lineHeight: 1.6, margin: '0 0 40px',
            maxWidth: '300px',
          }}>
            Sistem monitoring tumbuh kembang pediatrik tingkat lanjut, dirancang untuk tenaga medis profesional.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { icon: '📊', label: 'Analisis Data AI' },
              { icon: '🔒', label: 'Rekam Medis Aman' },
              { icon: '👶', label: 'KMS Digital' },
              { icon: '🏥', label: 'Multi Peran' },
            ].map((f) => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '7px 14px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.9)',
                fontSize: '12.5px', fontWeight: '600',
                color: '#166534',
                backdropFilter: 'blur(8px)',
              }}>
                <span>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-inner">
          <div className="login-mobile-brand">
            <div style={{
              width: '36px', height: '36px',
              background: '#16a34a',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L12 22M2 12L22 12" />
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#15803d' }}>
              tumbang<span style={{ color: '#16a34a' }}>.</span>id
            </span>
          </div>

          <div style={{ marginBottom: '36px' }}>
            <h2 style={{
              fontSize: 'clamp(22px, 5vw, 26px)', fontWeight: '800',
              color: '#111827', margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}>
              Masuk ke <span style={{ color: '#16a34a' }}>Tumbang.id</span>
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6b7280', margin: 0 }}>
              Pantau tumbuh kembang balita dengan presisi AI
            </p>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="field-label">Alamat Email / Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="field-input"
                placeholder="Masukkan username"
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label className="field-label">Kata Sandi</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="Masukkan password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', alignItems: 'center',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '24px', marginTop: '12px',
            }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: '13px', color: '#374151',
                cursor: 'pointer',
              }}>
                <input type="checkbox" style={{ accentColor: '#16a34a' }} />
                Ingat Saya
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
