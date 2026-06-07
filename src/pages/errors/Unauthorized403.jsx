import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized403 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl filter animate-pulse"></div>

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        <div className="inline-flex p-4 bg-rose-500/10 rounded-2xl text-rose-400 mb-6 border border-rose-500/20">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Akses Ditolak (403)</h2>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          Maaf, Anda tidak memiliki izin yang sah untuk mengakses halaman ini. Peran akun Anda dibatasi oleh matriks Route Guard.
        </p>

        <button
          onClick={handleGoBack}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-2xl shadow-lg mt-8 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali Ke Halaman Sebelumnya
        </button>
      </div>
    </div>
  );
};

export default Unauthorized403;
