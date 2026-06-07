import React, { useState, useEffect } from 'react';
import { balitaService, antropometriService, laporanService } from '../../services/apiServices';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Baby, Download, Scale, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton, { ChartSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

const OrangTuaDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [timbanganList, setTimbanganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const data = await balitaService.getBalitas();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChildId(data[0].id.toString());
        fetchHistory(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data anak');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (id) => {
    setLoadingCharts(true);
    try {
      const data = await antropometriService.getRiwayatTimbangan(id);
      const activeChild = children.find(c => c.id.toString() === id.toString());
      const birthday = activeChild ? new Date(activeChild.tanggal_lahir) : null;

      const mappedData = data.map((item, idx) => {
        let umurBulan = 0;
        if (birthday) {
          const timbangDate = new Date(item.tanggal_timbang);
          const diffTime = Math.abs(timbangDate - birthday);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          umurBulan = Math.floor(diffDays / 30);
        } else {
          umurBulan = idx;
        }
        return {
          ...item,
          umurBulan: `${umurBulan} bln`,
          'Berat (kg)': item.berat_badan,
          'Tinggi (cm)': item.tinggi_badan,
        };
      });

      setTimbanganList(mappedData);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat riwayat timbangan');
    } finally {
      setLoadingCharts(false);
    }
  };

  const handleChildChange = (e) => {
    const id = e.target.value;
    setSelectedChildId(id);
    if (id) fetchHistory(id);
  };

  const handleDownload = async () => {
    const active = children.find(c => c.id.toString() === selectedChildId);
    if (!active) return;
    try {
      toast.loading('Mempersiapkan laporan PDF...', { id: 'pdf-toast' });
      await laporanService.downloadLaporanPdf(active.id, active.nama);
      toast.success('Laporan berhasil diunduh', { id: 'pdf-toast' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Gagal mengunduh laporan', { id: 'pdf-toast' });
    }
  };

  const activeChild = children.find(c => c.id.toString() === selectedChildId);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p style={{ fontWeight: '700', color: '#374151', marginBottom: '6px' }}>{label}</p>
          {payload.map((p) => (
            <p key={p.name} style={{ color: p.color, margin: '2px 0', fontWeight: '600' }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <PageHeader
        title="Perkembangan Anak"
        subtitle="Kartu Menuju Sehat (KMS) dan tumbuh kembang anak Anda"
        action={activeChild && (
          <button onClick={handleDownload} className="btn-primary">
            <Download size={15} />
            Unduh Laporan
          </button>
        )}
      />

      {loading ? (
        <div>
          <div className="grid-orangtua-top">
            <div className="skeleton-card skeleton-row">
              <Skeleton width={40} height={40} circle />
              <div style={{ flex: 1 }}>
                <Skeleton width={110} height={10} style={{ marginBottom: 10 }} />
                <Skeleton width="70%" height={16} />
              </div>
            </div>
            <div className="skeleton-card" style={{ background: '#16a34a', borderColor: '#16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                {[0, 1, 2].map((item) => (
                  <div key={item} style={{ flex: 1 }}>
                    <Skeleton width={90} height={10} style={{ marginBottom: 10, background: '#86efac' }} />
                    <Skeleton width="75%" height={18} style={{ marginBottom: 8, background: '#bbf7d0' }} />
                    <Skeleton width="55%" height={11} style={{ background: '#86efac' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid-charts-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      ) : children.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Baby size={24} color="#cbd5e1" /></div>
            <p>Belum ada data anak terhubung ke akun Anda.</p>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>Hubungi Kader Posyandu untuk registrasi.</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid-orangtua-top">
            <div className="card selector-card">
              <div className="icon-circle icon-circle-green" style={{ width: '42px', height: '42px' }}>
                <Baby size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="field-label" style={{ marginBottom: '4px' }}>Pilih Profil Anak</div>
                <select
                  value={selectedChildId}
                  onChange={handleChildChange}
                  className="field-input"
                >
                  {children.map(c => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeChild && (
              <div className="child-info-banner">
                <div>
                  <div className="banner-stat-label">Nama Anak</div>
                  <div className="banner-stat-value" style={{ fontSize: '20px' }}>{activeChild.nama}</div>
                  <div className="banner-stat-sub" style={{ fontFamily: 'monospace' }}>NIK: {activeChild.nik}</div>
                </div>
                <div className="info-divider" />
                <div>
                  <div className="banner-stat-label">Tanggal Lahir</div>
                  <div className="banner-stat-value">{activeChild.tanggal_lahir}</div>
                  <div className="banner-stat-sub">{activeChild.jenis_kelamin}</div>
                </div>
                <div className="info-divider" />
                <div>
                  <div className="banner-stat-label">Status Tumbuh Kembang</div>
                  <div style={{ marginTop: '4px' }}>
                    {timbanganList && timbanganList.length > 0 ? (
                      (() => {
                        // Ambil timbangan terakhir berdasarkan tanggal_timbang paling baru
                        const sorted = [...timbanganList].sort((a, b) => new Date(b.tanggal_timbang) - new Date(a.tanggal_timbang));
                        const lastTimbang = sorted[0];
                        const isStunting = lastTimbang.status_gizi === 'Stunting';
                        return (
                          <span className={`badge ${isStunting ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                            {isStunting ? '⚠ STUNTING' : '✓ NORMAL'}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize: '12px', padding: '4px 10px' }}>Belum Ada Data</span>
                    )}
                  </div>
                  <div className="banner-stat-sub" style={{ marginTop: '4px' }}>Kondisi Saat Ini</div>
                </div>
              </div>
            )}
          </div>

          {loadingCharts ? (
            <div className="grid-charts-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : timbanganList.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon"><TrendingUp size={24} color="#cbd5e1" /></div>
                <p>Belum ada riwayat timbangan bulanan untuk anak ini.</p>
              </div>
            </div>
          ) : (
            <div className="grid-charts-2">
              <div className="card chart-panel">
                <div className="chart-panel-header">
                  <div>
                    <div className="chart-panel-title">Kurva Berat Badan / Umur</div>
                    <div className="chart-panel-subtitle">BB/U — Standar WHO</div>
                  </div>
                  <Scale size={16} color="#9ca3af" />
                </div>
                <div className="chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timbanganList}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="umurBulan" fontSize={11} stroke="#d1d5db" tick={{ fill: '#9ca3af' }} />
                      <YAxis fontSize={11} stroke="#d1d5db" unit="kg" tick={{ fill: '#9ca3af' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="Berat (kg)" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card chart-panel">
                <div className="chart-panel-header">
                  <div>
                    <div className="chart-panel-title">Kurva Tinggi Badan / Umur</div>
                    <div className="chart-panel-subtitle">TB/U — Standar WHO</div>
                  </div>
                  <TrendingUp size={16} color="#9ca3af" />
                </div>
                <div className="chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timbanganList}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="umurBulan" fontSize={11} stroke="#d1d5db" tick={{ fill: '#9ca3af' }} />
                      <YAxis fontSize={11} stroke="#d1d5db" unit="cm" tick={{ fill: '#9ca3af' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="Tinggi (cm)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrangTuaDashboard;
