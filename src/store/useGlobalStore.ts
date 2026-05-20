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
    
    let productsList: Polo[] = [];
    let settingsData: AppSettings = {
      logoUrl: '',
      brandName: 'Mz.B',
      brandSubtitle: 'Lt.6',
      contactPhone: '999999999',
      yapeNumber: '999999999',
      yapeTitular: 'MARCOS URBANO',
      whatsappLink: 'https://wa.me/51999999999',
      instagramLink: 'https://instagram.com/',
      tiktokLink: 'https://tiktok.com/',
      heroTitle: 'URBAN SOUL UNIT',
      heroSubtitle: 'MZ.B LT.6 • TIENDA DE POLOS URBANOS',
      heroImages: [
        'https://images.unsplash.com/photo-1558363420-281039867f73?auto=format&fit=crop&q=80&w=1600',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600'
      ],
      qrCodeUrl: '',
      adminPassword: 'admin'
    };

    try {
      const p = await apiService.getProducts();
      if (p && Array.isArray(p)) {
        productsList = p;
      }
    } catch (err) {
      console.error("Error reading products:", err);
    }

    try {
      const s = await apiService.getSettings();
      if (s && typeof s === 'object') {
        settingsData = s;
      }
    } catch (err) {
      console.error("Error reading settings:", err);
    }

    set({ products: productsList, settings: settingsData, loading: false });
  },

  setSettings: (settings) => set({ settings }),
  setProducts: (products) => set({ products }),
}));
