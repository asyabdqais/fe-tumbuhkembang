import { create } from 'zustand';
import api from '../config/axios';

export const useAuthStore = create((set) => ({
  userRole: localStorage.getItem('user_role') || null,
  user: (() => {
    try {
      const data = localStorage.getItem('user_data');
      return data && data !== 'undefined' ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem('user_role'),
  loading: false,
  isInitializing: true, // true sampai checkAuth pertama kali selesai

  login: async (username, password) => {
    set({ loading: true });
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { redirect_to } = response.data;
      
      // Dapatkan data user me setelah sukses login untuk melengkapi profil
      const userResponse = await api.get('/api/auth/me');
      const userData = userResponse.data;
      
      localStorage.setItem('user_role', redirect_to);
      localStorage.setItem('user_data', JSON.stringify(userData));

      set({
        userRole: redirect_to,
        user: userData,
        isAuthenticated: true,
        loading: false,
      });

      return redirect_to;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
      set({
        userRole: null,
        user: null,
        isAuthenticated: false,
      });
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    set({ isInitializing: true });
    try {
      const userResponse = await api.get('/api/auth/me');
      const userData = userResponse.data;
      
      // Mapping role ke string path
      let rolePath = 'orangtua';
      if (userData.role === 'Admin') rolePath = 'admin';
      else if (userData.role === 'Dokter') rolePath = 'dokter';
      else if (userData.role === 'Kader') rolePath = 'kader';
      
      localStorage.setItem('user_role', rolePath);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      set({
        userRole: rolePath,
        user: userData,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch (error) {
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
      set({
        userRole: null,
        user: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  }
}));
