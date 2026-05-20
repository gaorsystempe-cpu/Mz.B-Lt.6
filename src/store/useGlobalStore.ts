import { create } from 'zustand';
import { Polo, AppSettings } from '../types';
import { apiService } from '../services/apiService';

interface GlobalState {
  products: Polo[];
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  fetchInitialData: () => Promise<void>;
  setSettings: (settings: AppSettings) => void;
  setProducts: (products: Polo[]) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  products: [],
  settings: null,
  loading: true,
  error: null,

  fetchInitialData: async () => {
    set({ loading: true, error: null });
    try {
      const [products, settings] = await Promise.all([
        apiService.getProducts(),
        apiService.getSettings()
      ]);
      set({ products, settings, loading: false });
    } catch (err) {
      set({ error: "No se pudo cargar la información", loading: false });
    }
  },

  setSettings: (settings) => set({ settings }),
  setProducts: (products) => set({ products }),
}));
