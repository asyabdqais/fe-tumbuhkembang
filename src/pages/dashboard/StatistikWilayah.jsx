import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ClipboardList, TrendingUp, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChartSkeleton, StatCardsSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const StatistikWilayah = () => {
  const [summary, setSummary] = useState(null);
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [sumRes, regRes] = await Promise.all([
        api.get('/api/laporan/ringkasan'),
        api.get('/api/laporan/per-wilayah')
      ]);
      setSummary(sumRes.data);
      setRegionData(regRes.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data statistik');
    } finally {
      setLoading(false);
    }
  };

  const getPieData = () => {
    if (!summary || !summary.rincian_per_status_gizi) return [];
    return summary.rincian_per_status_gizi.map(item => ({
      name: item.status_gizi,
      value: item.jumlah
    }));
  };

  const getBarData = () => {
    return regionData.map(item => ({
      name: item.rw_desa,
      'Kasus Bermasalah': item.stunting,
      'Total Balita': item.total,
      'Persentase (%)': item.persentase_stunting
    }));
  };

  return (
    <div>
      <PageHeader
        title="Statistik Wilayah"
        subtitle="Analisis sebaran dan agregat kasus stunting puskesmas"
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <StatCardsSkeleton count={3} />
          <div className="grid-charts-panel">
            <ChartSkeleton height={380} />
            <ChartSkeleton height={380} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="grid-metrics">
            <div className="metric-card">
              <div className="metric-icon metric-icon-green">
                <ClipboardList size={24} />
              </div>
              <div>
                <div className="metric-label">Total Pemeriksaan</div>
                <div className="metric-value">{summary?.total_pemeriksaan}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon metric-icon-red">
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="metric-label">Kasus Bermasalah</div>
                <div className="metric-value">{summary?.total_kasus_bermasalah}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon metric-icon-amber">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="metric-label">Rasio Stunting</div>
                <div className="metric-value">{summary?.persentase_stunting}%</div>
              </div>
            </div>
          </div>

          <div className="grid-charts-panel">
            <div className="card chart-panel" style={{ minHeight: '380px' }}>
              <div className="chart-panel-header">
                <div className="chart-panel-title">Distribusi Status Gizi</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getPieData().length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>Tidak ada data</p>
                ) : (
                  <div style={{ width: '100%', height: '260px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ flex: 1, minHeight: '180px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={78}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {getPieData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} Anak`, 'Jumlah']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', fontSize: '12px' }}>
                      {getPieData().map((entry, index) => (
                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length], display: 'inline-block' }} />
                          <span style={{ fontWeight: 600, color: '#334155' }}>{entry.name}:</span>
                          <span style={{ color: '#64748b', fontWeight: 700 }}>{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card chart-panel" style={{ minHeight: '380px' }}>
              <div className="chart-panel-header">
                <div className="chart-panel-title">Sebaran Stunting Per RW/Desa</div>
              </div>
              <div className="chart-area">
                {getBarData().length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Tidak ada data wilayah
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBarData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                      <YAxis fontSize={11} stroke="#94a3b8" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Kasus Bermasalah" fill="#ef4444" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Total Balita" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatistikWilayah;
