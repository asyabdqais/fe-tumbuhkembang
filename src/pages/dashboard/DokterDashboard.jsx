import React, { useState, useEffect } from 'react';
import { intervensiService } from '../../services/apiServices';
import MDEditor from '@uiw/react-md-editor';

import {
  Stethoscope, Sparkles, CheckCircle, AlertTriangle, RefreshCw,
  Baby, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton, { CardListSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

const DokterDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [rekomendasi, setRekomendasi] = useState('');
  const [isRujukan, setIsRujukan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await intervensiService.getUnapproved();
      setCases(data);
      if (data.length > 0) {
        selectCase(data[0]);
      } else {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil antrean kasus');
    } finally {
      setLoading(false);
    }
  };

  const selectCase = (c) => {
    setSelectedCase(c);
    setRekomendasi(c.rekomendasi_ai || '');
    setIsRujukan(c.is_rujukan_rsud || false);
  };

  const handleApprove = async () => {
    if (!selectedCase) return;
    setSaving(true);
    try {
      await intervensiService.validate(selectedCase.id, {
        rekomendasi_ai: rekomendasi,
        is_approved: true,
        is_rujukan_rsud: isRujukan
      });
      toast.success('Rekomendasi berhasil disetujui');
      fetchCases();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memvalidasi intervensi');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedCase) return;
    setRegenerating(true);
    try {
      const res = await intervensiService.regenerate(selectedCase.id);
      setRekomendasi(res.rekomendasi_ai);
      setCases(cases.map(c => c.id === selectedCase.id ? { ...c, rekomendasi_ai: res.rekomendasi_ai } : c));
      toast.success('Rekomendasi AI berhasil diregenerasi');
    } catch (err) {
      console.error(err);
      toast.error('Gagal meregenerasi resep');
    } finally {
      setRegenerating(false);
    }
  };

  const getStatusGiziBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('stunting') || s.includes('buruk') || s.includes('sangat')) return 'badge-red';
    if (s.includes('kurang') || s.includes('risiko') || s.includes('wasting')) return 'badge-amber';
    return 'badge-green';
  };

  return (
    <div>
      <PageHeader
        title="Antrean Kasus Medis"
        subtitle="Validasi dan kustomisasi rekomendasi gizi oleh dokter"
        action={
          <span className="status-pill">
            <Stethoscope size={14} />
            {cases.length} Kasus Pending
          </span>
        }
      />

      {loading ? (
        <div className="grid-dokter">
          <CardListSkeleton rows={6} />
          <div className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <Skeleton width={210} height={17} style={{ marginBottom: 10 }} />
                <Skeleton width={300} height={12} />
              </div>
              <Skeleton width={120} height={34} />
            </div>
            <div style={{ marginTop: 18 }}>
              <Skeleton width={220} height={13} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={260} />
            </div>
          </div>
        </div>
      ) : cases.length === 0 ? (
        <div className="card">
          <div className="empty-state empty-state-success">
            <div className="empty-state-icon"><CheckCircle size={28} color="#16a34a" /></div>
            <p style={{ color: '#16a34a', fontWeight: '600' }}>Semua kasus telah divalidasi</p>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>Tidak ada draf intervensi pending saat ini.</p>
          </div>
        </div>
      ) : (
        <div className="grid-dokter">
          <div className="card card-flush dokter-case-list" style={{ maxHeight: '620px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <Stethoscope size={15} color="#94a3b8" />
              <span className="card-header-title">Antrean Pending ({cases.length})</span>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {cases.map((c) => {
                const balitaName = c.antropometri?.balita_nama || `Balita ID ${c.antropometri?.balita_id}`;
                const statusGizi = c.antropometri?.status_gizi || 'Malnutrisi';
                const isSelected = selectedCase?.id === c.id;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCase(c)}
                    className={`case-item ${isSelected ? 'active' : ''}`}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="case-item-name">{balitaName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${getStatusGiziBadge(statusGizi)}`} style={{ fontSize: '10px' }}>
                          {statusGizi}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>
                          Z: {c.antropometri?.z_score?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} color={isSelected ? '#16a34a' : '#d1d5db'} />
                  </button>
                );
              })}
            </div>
          </div>

          {selectedCase && (
            <div className="card panel-reveal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="dokter-case-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Baby size={16} color="#9ca3af" />
                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#111827' }}>
                      {selectedCase.antropometri?.balita_nama || `Balita ID ${selectedCase.antropometri?.balita_id}`}
                    </h2>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Berat: <strong style={{ color: '#374151' }}>{selectedCase.antropometri?.berat_badan} kg</strong></span>
                    <span>Tinggi: <strong style={{ color: '#374151' }}>{selectedCase.antropometri?.tinggi_badan} cm</strong></span>
                    <span>Status: <strong style={{ color: '#dc2626' }}>{selectedCase.antropometri?.status_gizi}</strong></span>
                  </div>
                </div>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="btn-secondary"
                  style={{ fontSize: '12px' }}
                >
                  <RefreshCw size={13} style={{ animation: regenerating ? 'spin 0.7s linear infinite' : 'none' }} />
                  Regenerasi AI
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                  <Sparkles size={14} color="#16a34a" />
                  Edit Rekomendasi Menu Gizi & Intervensi (Markdown)
                </label>
                <div data-color-mode="light" className="editor-shell" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <MDEditor
                    value={rekomendasi}
                    onChange={setRekomendasi}
                    height={300}
                    preview="edit"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  Konten berformat Teks/Markdown biasa. Tambahkan <strong>**tebal**</strong> atau <em>*miring*</em> jika perlu.
                </p>
              </div>

              <div className="alert-box alert-box-amber">
                <input
                  id="rujukan-rsud"
                  type="checkbox"
                  checked={isRujukan}
                  onChange={(e) => setIsRujukan(e.target.checked)}
                />
                <label htmlFor="rujukan-rsud" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <AlertTriangle size={14} color="#d97706" />
                  Tandai kasus ini untuk Rujuk ke RSUD
                </label>
              </div>

              <div className="form-actions" style={{ marginTop: 0, paddingTop: '4px' }}>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '11px 24px' }}
                >
                  <CheckCircle size={15} />
                  {saving ? 'Menyimpan...' : 'Validasi & Setujui Resep'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DokterDashboard;
