import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, balitaService, laporanService } from '../../services/apiServices';
import { UserPlus, Scale, Download, MapPin, Baby, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton, FieldSkeleton } from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

const KaderDashboard = () => {
  const [balitas, setBalitas] = useState([]);
  const [orangTuas, setOrangTuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrangTuas, setLoadingOrangTuas] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Laki-laki');
  const [orangTuaId, setOrangTuaId] = useState('');
  const [rwDesa, setRwDesa] = useState('');
  const [kondisiGeografis, setKondisiGeografis] = useState('Daratan/Umum');
  const [submitting, setSubmitting] = useState(false);

  const fetchBalitas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await balitaService.getBalitas();
      setBalitas(data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data balita');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrangTuas = useCallback(async () => {
    setLoadingOrangTuas(true);
    try {
      const data = await authService.listUsers('Orang Tua');
      setOrangTuas(data);
      if (data.length > 0) {
        setOrangTuaId((current) => current || data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat daftar orang tua');
    } finally {
      setLoadingOrangTuas(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBalitas();
    fetchOrangTuas();
  }, [fetchBalitas, fetchOrangTuas]);

  const handleDeleteBalita = async (id, namaBalita) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus profil balita "${namaBalita}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmDelete) return;

    try {
      toast.loading('Menghapus data balita...', { id: 'delete-toast' });
      await balitaService.softDelete(id);
      toast.success('Data balita berhasil dihapus', { id: 'delete-toast' });
      fetchBalitas();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Gagal menghapus data balita', { id: 'delete-toast' });
    }
  };

  const handleAddBalita = async (e) => {
    e.preventDefault();
    if (!nama || !nik || !tanggalLahir) {
      toast.error('Nama, NIK, dan Tanggal Lahir wajib diisi');
      return;
    }
    if (!orangTuaId) {
      toast.error('Pilih akun Orang Tua terlebih dahulu');
      return;
    }
    if (nik.length !== 16) {
      toast.error('NIK harus 16 digit');
      return;
    }
    setSubmitting(true);
    try {
      await balitaService.createBalita({
        nama,
        nik,
        tanggal_lahir: tanggalLahir,
        jenis_kelamin: jenisKelamin,
        orang_tua_id: parseInt(orangTuaId, 10),
        rw_desa: rwDesa,
        kondisi_geografis: kondisiGeografis
      });
      toast.success('Profil balita berhasil ditambahkan');
      setShowAddForm(false);
      setNama(''); setNik(''); setTanggalLahir('');
      setOrangTuaId(orangTuas[0]?.id?.toString() || '');
      setJenisKelamin('Laki-laki'); setRwDesa('');
      setKondisiGeografis('Daratan/Umum');
      fetchBalitas();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Gagal menambahkan balita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadLaporan = async (id, namaBalita) => {
    try {
      toast.loading('Mempersiapkan laporan PDF...', { id: 'pdf-toast' });
      await laporanService.downloadLaporanPdf(id, namaBalita);
      toast.success('Laporan berhasil diunduh', { id: 'pdf-toast' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Gagal mengunduh laporan', { id: 'pdf-toast' });
    }
  };

  return (
    <div>
      <PageHeader
        title="Daftar Anak"
        subtitle="Kelola data balita dan pantau kegiatan posyandu lapangan"
        action={
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            <UserPlus size={15} />
            {showAddForm ? 'Batal' : 'Tambah Balita Baru'}
          </button>
        }
      />

      {showAddForm && (
        <div className="card form-card-narrow panel-reveal" style={{ marginBottom: '20px', maxWidth: '720px' }}>
          <div className="card-section-title">
            <UserPlus size={16} color="#0d9b5c" />
            Biodata Balita Baru
          </div>
          <form onSubmit={handleAddBalita}>
            <div className="grid-form-2">
              <div>
                <label className="field-label">Nama Lengkap</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)}
                  className="field-input" placeholder="Nama Balita" />
              </div>
              <div>
                <label className="field-label">NIK (16 Digit)</label>
                <input type="text" maxLength="16" value={nik} onChange={(e) => setNik(e.target.value)}
                  className="field-input" placeholder="16 Digit NIK" />
              </div>
              <div>
                <label className="field-label">Tanggal Lahir</label>
                <input type="date" value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)}
                  className="field-input" />
              </div>
              <div>
                <label className="field-label">Jenis Kelamin</label>
                <select value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)}
                  className="field-input">
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="field-label">Akun Orang Tua</label>
                {loadingOrangTuas ? (
                  <FieldSkeleton />
                ) : (
                  <select
                    value={orangTuaId}
                    onChange={(e) => setOrangTuaId(e.target.value)}
                    className="field-input"
                    disabled={orangTuas.length === 0}
                  >
                    {orangTuas.length === 0 ? (
                      <option value="">Belum ada akun Orang Tua</option>
                    ) : (
                      orangTuas.map((orangTua) => (
                        <option key={orangTua.id} value={orangTua.id}>
                          {orangTua.username}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
              <div>
                <label className="field-label">RW / Desa</label>
                <input type="text" value={rwDesa} onChange={(e) => setRwDesa(e.target.value)}
                  className="field-input" placeholder="Contoh: RW 04 Desa Cipedak" />
              </div>
              <div>
                <label className="field-label">Kondisi Geografis</label>
                <select value={kondisiGeografis} onChange={(e) => setKondisiGeografis(e.target.value)}
                  className="field-input">
                  <option>Daratan/Umum</option>
                  <option>Kepulauan/Pesisir</option>
                  <option>Pegunungan/Terpencil</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || loadingOrangTuas || orangTuas.length === 0}
                className="btn-primary"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Balita'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card card-flush">
        <div className="card-header">
          <Baby size={16} color="#94a3b8" />
          <span className="card-header-title">Data Balita Terdaftar ({balitas.length})</span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : balitas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Baby size={24} color="#cbd5e1" /></div>
            <p>Belum ada data anak terdaftar. Silakan tambah balita baru.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Balita</th>
                  <th>NIK</th>
                  <th>Tanggal Lahir / JK</th>
                  <th>Wilayah</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {balitas.map((balita) => (
                  <tr key={balita.id}>
                    <td>
                      <div className="user-row">
                        <div className={`user-avatar ${balita.jenis_kelamin === 'Laki-laki' ? 'user-avatar-blue' : 'user-avatar-pink'}`}>
                          {balita.nama?.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{balita.nama}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>
                      {balita.nik}
                    </td>
                    <td>
                      <div className="user-name">{balita.tanggal_lahir}</div>
                      <div style={{ fontSize: '11.5px', color: '#9ca3af', marginTop: '2px' }}>
                        {balita.jenis_kelamin}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#374151' }}>
                        <MapPin size={12} color="#9ca3af" />
                        {balita.rw_desa || '-'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {balita.kondisi_geografis}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions">
                        <button
                          onClick={() => navigate(`/dashboard/kader/input?balita_id=${balita.id}`)}
                          className="btn-icon btn-green"
                        >
                          <Scale size={12} />
                          Timbang
                        </button>
                        <button
                          onClick={() => handleDownloadLaporan(balita.id, balita.nama)}
                          className="btn-icon btn-blue"
                        >
                          <Download size={12} />
                          PDF
                        </button>
                        <button
                          onClick={() => handleDeleteBalita(balita.id, balita.nama)}
                          className="btn-icon"
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            borderColor: '#fecaca',
                            border: '1px solid #fecaca'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc2626';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.borderColor = '#fecaca';
                          }}
                        >
                          <Trash2 size={12} />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KaderDashboard;
