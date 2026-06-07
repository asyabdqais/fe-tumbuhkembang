import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { balitaService, antropometriService } from '../../services/apiServices';
import { Scale, Heart, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FieldSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

const InputTimbangan = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const balitaIdFromParam = searchParams.get('balita_id');

  const [balitas, setBalitas] = useState([]);
  const [selectedBalitaId, setSelectedBalitaId] = useState(balitaIdFromParam || '');
  const [loadingBalitas, setLoadingBalitas] = useState(false);

  const [beratBadan, setBeratBadan] = useState('');
  const [tinggiBadan, setTinggiBadan] = useState('');
  const [lila, setLila] = useState('');
  const [lingkarKepala, setLingkarKepala] = useState('');
  const [statusImunisasi, setStatusImunisasi] = useState('Lengkap');
  const [asiEksklusif, setAsiEksklusif] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchBalitas();
  }, []);

  const fetchBalitas = async () => {
    setLoadingBalitas(true);
    try {
      const data = await balitaService.getBalitas();
      setBalitas(data);
      if (balitaIdFromParam) {
        setSelectedBalitaId(balitaIdFromParam);
      } else if (data.length > 0) {
        setSelectedBalitaId(data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil daftar balita');
    } finally {
      setLoadingBalitas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBalitaId) { toast.error('Silakan pilih balita terlebih dahulu'); return; }
    if (!beratBadan || !tinggiBadan) { toast.error('Berat Badan dan Tinggi Badan wajib diisi'); return; }

    setSubmitting(true);
    setResult(null);

    try {
      const payload = {
        balita_id: parseInt(selectedBalitaId),
        tanggal_timbang: new Date().toISOString().split('T')[0],
        berat_badan: parseFloat(beratBadan),
        tinggi_badan: parseFloat(tinggiBadan),
        lila: lila ? parseFloat(lila) : null,
        lingkar_kepala: lingkarKepala ? parseFloat(lingkarKepala) : null,
        status_imunisasi: statusImunisasi,
        asi_eksklusif: asiEksklusif,
      };
      const res = await antropometriService.createAntropometri(payload);
      setResult(res);
      toast.success('Data antropometri berhasil disimpan');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Gagal menyimpan data antropometri');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (statusGizi) => {
    const s = (statusGizi || '').toLowerCase();
    if (s.includes('buruk') || s.includes('stunting') || s.includes('sangat')) return 'result-panel-danger';
    if (s.includes('kurang') || s.includes('wasting') || s.includes('risiko')) return 'result-panel-warning';
    return 'result-panel-success';
  };

  const activeBalita = balitas.find((b) => b.id.toString() === selectedBalitaId);

  return (
    <div>
      <PageHeader
        title="Input Timbangan Bulanan"
        subtitle="Pencatatan antropometri balita di posyandu"
        action={
          <button onClick={() => navigate('/dashboard/kader')} className="btn-secondary">
            <ArrowLeft size={15} />
            Kembali
          </button>
        }
      />

      <div className="grid-split-2" style={{ maxWidth: '900px' }}>
        <div className="card">
          <div className="card-section-title">
            <Scale size={16} color="#0d9b5c" />
            Data Pengukuran
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Pilih Anak</label>
              {loadingBalitas ? (
                <FieldSkeleton />
              ) : (
                <select
                  value={selectedBalitaId}
                  onChange={(e) => { setSelectedBalitaId(e.target.value); setResult(null); }}
                  className="field-input"
                >
                  <option value="">-- Pilih Balita --</option>
                  {balitas.map((b) => (
                    <option key={b.id} value={b.id}>{b.nama} (NIK: {b.nik})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid-form-2" style={{ gap: '12px', marginBottom: '14px' }}>
              <div>
                <label className="field-label">Berat Badan (kg)</label>
                <input type="number" step="0.01" value={beratBadan}
                  onChange={(e) => setBeratBadan(e.target.value)}
                  className="field-input" placeholder="0.00" />
              </div>
              <div>
                <label className="field-label">Tinggi Badan (cm)</label>
                <input type="number" step="0.1" value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(e.target.value)}
                  className="field-input" placeholder="0.0" />
              </div>
            </div>

            <div className="grid-form-2" style={{ gap: '12px', marginBottom: '14px' }}>
              <div>
                <label className="field-label">LILA (cm) — Opsional</label>
                <input type="number" step="0.1" value={lila}
                  onChange={(e) => setLila(e.target.value)}
                  className="field-input" placeholder="Lingkar Lengan" />
              </div>
              <div>
                <label className="field-label">Lingkar Kepala (cm)</label>
                <input type="number" step="0.1" value={lingkarKepala}
                  onChange={(e) => setLingkarKepala(e.target.value)}
                  className="field-input" placeholder="Opsional" />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label className="field-label">Status Imunisasi</label>
              <select value={statusImunisasi} onChange={(e) => setStatusImunisasi(e.target.value)}
                className="field-input">
                <option value="Lengkap">Lengkap (Sesuai Usia)</option>
                <option value="Belum Lengkap">Belum Lengkap</option>
                <option value="Tidak Imunisasi">Tidak Imunisasi</option>
              </select>
            </div>

            <div className="alert-box" style={{ marginBottom: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <input
                id="asi-eksklusif"
                type="checkbox"
                checked={asiEksklusif}
                onChange={(e) => setAsiEksklusif(e.target.checked)}
              />
              <label htmlFor="asi-eksklusif" style={{ fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                Menerima ASI Eksklusif
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            >
              <Scale size={15} />
              {submitting ? 'Menghitung Z-Score...' : 'Kirim & Proses Antropometri'}
            </button>
          </form>
        </div>

        {result ? (
          <div className={`result-panel panel-reveal ${getStatusClass(result.status_gizi)}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="result-badge">{result.status_gizi}</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginTop: '10px' }}>
                  {activeBalita?.nama}
                </div>
                <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '3px' }}>
                  Tanggal Timbang: {result.tanggal_timbang}
                </div>
              </div>
              <Heart size={28} color="#dc2626" style={{ flexShrink: 0 }} />
            </div>

            <div className="divider" />

            <div className="grid-form-2" style={{ gap: '16px', marginBottom: '16px' }}>
              <div className="result-metric-box">
                <div className="field-label">Z-Score</div>
                <div className="result-metric-value">{result.z_score?.toFixed(2)}</div>
              </div>
              <div className="result-metric-box">
                <div className="field-label">Berat / Tinggi</div>
                <div className="result-metric-value" style={{ fontSize: '16px' }}>{result.berat_badan} kg</div>
                <div style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{result.tinggi_badan} cm</div>
              </div>
            </div>

            <div className="result-note">
              <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                  Data Tersimpan
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>
                  Data antropometri berhasil dicatat. Status gizi dihitung berdasarkan tabel referensi WHO.
                  {['Kurang', 'Gizi Buruk', 'Stunting', 'Wasting'].includes(result.status_gizi) && (
                    <span style={{ display: 'block', fontWeight: '700', marginTop: '6px', color: '#dc2626', fontSize: '11.5px' }}>
                      Terdeteksi berisiko — Rekomendasi AI otomatis dibuat & menunggu validasi Dokter.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="result-placeholder">
            <AlertCircle size={32} color="#d1d5db" />
            <div>
              <p style={{ fontWeight: '600', fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>
                Belum Ada Hasil Kalkulasi
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, maxWidth: '220px' }}>
                Isi data antropometri dan klik tombol kirim untuk menghitung Z-Score.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputTimbangan;
