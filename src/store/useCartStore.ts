import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Polo } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (polo: Polo, size: CartItem['size'], color: Polo['colors'][0]) => void;
  removeItem: (poloId: string, size: CartItem['size'], colorName: string) => void;
  updateQuantity: (poloId: string, size: CartItem['size'], colorName: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (polo, size, color) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === polo.id && item.size === size && item.selectedColor?.name === color.name
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === polo.id && item.size === size && item.selectedColor?.name === color.name
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...polo, size, selectedColor: color, quantity: 1 }] };
        });
      },
      removeItem: (poloId, size, colorName) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === poloId && item.size === size && item.selectedColor?.name === colorName)
          ),
        }));
      },
      updateQuantity: (poloId, size, colorName, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === poloId && item.size === size && item.selectedColor?.name === colorName
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter(item => item.quantity > 0),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'polo-hub-cart',
    }
  )
);
