import api from '../config/axios';

const sanitizeFilename = (value) => {
  return (value || 'Laporan_Tumbuh_Kembang_Anak')
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_');
};

const base64ToBlob = (base64, mimeType = 'application/pdf') => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
};

export const authService = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  listUsers: async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.get('/api/auth/users', { params });
    return response.data;
  }
};

export const balitaService = {
  createBalita: async (balitaData) => {
    const response = await api.post('/api/balita/', balitaData);
    return response.data;
  },
  getBalitas: async () => {
    const response = await api.get('/api/balita/');
    return response.data;
  },
  getBalitaDetail: async (id) => {
    const response = await api.get(`/api/balita/${id}`);
    return response.data;
  },
  softDelete: async (id) => {
    const response = await api.delete(`/api/balita/${id}`);
    return response.data;
  }
};

export const antropometriService = {
  createAntropometri: async (antropometriData) => {
    const response = await api.post('/api/antropometri/', antropometriData);
    return response.data;
  },
  getRiwayatTimbangan: async (balitaId) => {
    const response = await api.get(`/api/antropometri/balita/${balitaId}`);
    return response.data;
  },
  deleteTimbangan: async (id) => {
    const response = await api.delete(`/api/antropometri/${id}`);
    return response.data;
  }
};

export const intervensiService = {
  getUnapproved: async () => {
    const response = await api.get('/api/intervensi/unapproved');
    return response.data;
  },
  validate: async (id, payload) => {
    // payload: { rekomendasi_ai: string, is_approved: boolean, is_rujukan_rsud: boolean }
    const response = await api.put(`/api/intervensi/${id}`, payload);
    return response.data;
  },
  getLatestForBalita: async (balitaId) => {
    const response = await api.get(`/api/intervensi/balita/${balitaId}`);
    return response.data;
  },
  regenerate: async (id) => {
    const response = await api.post(`/api/intervensi/${id}/regenerate`);
    return response.data;
  }
};

export const laporanService = {
  downloadLaporanPdf: async (balitaId, childName = 'Laporan_Tumbuh_Kembang_Anak') => {
    if (!balitaId) {
      throw new Error('ID balita tidak valid');
    }

    const fallbackFilename = `Laporan_Tumbuh_Kembang_${sanitizeFilename(childName)}.pdf`;
    const response = await api.get(`/api/laporan/balita/${balitaId}/data-laporan`);
    const filename = response.data?.filename || fallbackFilename;
    const contentBase64 = response.data?.content_base64;
    if (!contentBase64) {
      throw new Error('Data PDF tidak ditemukan dari server');
    }

    const blob = base64ToBlob(contentBase64, response.data?.mime_type || 'application/pdf');
    if (!blob.size) {
      throw new Error('File PDF kosong dari server');
    }

    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);

    return filename;
  }
};
