import React, { useState, useEffect } from 'react';
import { balitaService, intervensiService } from '../../services/apiServices';
import MDEditor from '@uiw/react-md-editor';
import { Baby, BookOpen, AlertCircle, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton, { CardListSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

const PanduanGizi = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [intervensi, setIntervensi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

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
        fetchRecipe(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data anak');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipe = async (id) => {
    setLoadingRecipe(true);
    setIntervensi(null);
    try {
      const res = await intervensiService.getLatestForBalita(id);
      setIntervensi(res);
    } catch (err) {
      console.error(err);
      setIntervensi(null);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleChildChange = (e) => {
    const id = e.target.value;
    setSelectedChildId(id);
    if (id) {
      fetchRecipe(id);
    }
  };

  const activeChild = children.find(c => c.id.toString() === selectedChildId);

  return (
    <div>
      <PageHeader
        title="Panduan Gizi & Resep MPASI"
        subtitle="Rekomendasi makanan sehat yang telah disetujui dokter puskesmas"
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="skeleton-card max-w-sm skeleton-row">
            <Skeleton width={48} height={48} circle />
            <div style={{ flex: 1 }}>
              <Skeleton width={120} height={10} style={{ marginBottom: 10 }} />
              <Skeleton width="70%" height={16} />
            </div>
          </div>
          <CardListSkeleton rows={5} />
        </div>
      ) : children.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Baby size={24} color="#cbd5e1" /></div>
            <p>Belum ada data anak terhubung ke akun Anda.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card selector-card" style={{ maxWidth: '360px' }}>
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

          {loadingRecipe ? (
            <div className="skeleton-card" style={{ minHeight: 300 }}>
              <div className="skeleton-row" style={{ paddingBottom: 18, borderBottom: '1px solid #f3f4f6', marginBottom: 18 }}>
                <Skeleton width={52} height={52} circle />
                <div style={{ flex: 1 }}>
                  <Skeleton width={180} height={18} style={{ marginBottom: 10 }} />
                  <Skeleton width="58%" height={11} />
                </div>
              </div>
              <Skeleton width="100%" height={12} style={{ marginBottom: 10 }} />
              <Skeleton width="92%" height={12} style={{ marginBottom: 10 }} />
              <Skeleton width="84%" height={12} style={{ marginBottom: 24 }} />
              <Skeleton width="100%" height={120} />
            </div>
          ) : intervensi ? (
            <div className="card panel-reveal recipe-panel" style={{ padding: '28px', border: '1px solid var(--primary-border)', background: 'linear-gradient(180deg, #ffffff 0%, rgba(240, 253, 250, 0.4) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div className="card-section-title" style={{ border: 'none', paddingBottom: 0, marginBottom: 0, display: 'flex', gap: '14px' }}>
                  <div className="icon-circle icon-circle-green" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Panduan Asupan Balita</h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px', margin: 0 }}>
                      Rekomendasi gizi personal untuk <strong>{activeChild?.nama}</strong>
                    </p>
                  </div>
                </div>
                <div className="recipe-badge" style={{ position: 'relative', top: 'auto', right: 'auto', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '30px', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Heart size={13} className="fill-current" />
                  Divalidasi Dokter
                </div>
              </div>

              {intervensi.is_rujukan_rsud && (
                <div className="alert-box alert-box-rose" style={{ alignItems: 'flex-start', marginTop: '16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, color: '#e11d48' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#be123c', marginBottom: '4px' }}>Pemberitahuan Rujukan Medis</span>
                    <span style={{ fontSize: '13px', color: '#9f1239', lineHeight: 1.5 }}>Dokter Puskesmas menandai kasus tumbuh kembang {activeChild?.nama} untuk segera dirujuk ke RSUD terdekat agar mendapat penanganan medis intensif.</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid #edf2f7', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jenis Kelamin</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{activeChild?.jenis_kelamin}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wilayah Layanan</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{activeChild?.rw_desa || '-'} ({activeChild?.kondisi_geografis})</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metode Rekomendasi</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0d9b5c' }}>Pediatrik AI Terintegrasi</span>
                </div>
              </div>

              <div data-color-mode="light" className="recipe-content" style={{ padding: '0 8px' }}>
                <MDEditor.Markdown source={intervensi.rekomendasi_ai} style={{ backgroundColor: 'transparent', color: '#334155' }} />
              </div>
            </div>
          ) : (
            <div className="result-placeholder" style={{ minHeight: '300px', background: '#ffffff', border: '2px dashed #e2e8f0', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #edf2f7' }}>
                <AlertCircle size={28} color="#94a3b8" />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '16px', color: '#334155', margin: '0 0 6px' }}>Belum Ada Rekomendasi Gizi</h4>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', margin: 0, lineHeight: 1.6 }}>
                  Saat ini belum ada panduan gizi yang divalidasi dokter untuk <strong>{activeChild?.nama}</strong>.<br />
                  Pastikan Kader telah mencatat antropometri bulanan anak untuk memicu rekomendasi gizi otomatis.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PanduanGizi;
