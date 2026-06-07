import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './hooks/useAuthStore';
import AppRouter from './routes/AppRouter';
import { Activity } from 'lucide-react';
import './App.css';

function App() {
  const { checkAuth, isInitializing } = useAuthStore();

  useEffect(() => {
    // Jalankan restorasi sesi saat pertama kali aplikasi dimuat
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Tumbang.id
              </h1>
              <p className="text-sm text-slate-500 mt-1">Memverifikasi sesi akun...</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Toast provider with modern dark glass design */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl shadow-xl text-sm font-sans font-medium',
          duration: 4000,
        }}
      />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
