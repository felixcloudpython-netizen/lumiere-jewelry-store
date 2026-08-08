'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, selectedSize?: number) => void;
  removeItem: (productId: string, size?: number) => void;
  updateQuantity: (productId: string, quantity: number, size?: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, selectedSize) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          item => item.product.id === product.id && item.selectedSize === selectedSize
        );
        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += 1;
          set({ items: newItems });
        } else {
          set({ items: [...items, { product, quantity: 1, selectedSize }] });
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            item => !(item.product.id === productId && item.selectedSize === size)
          ),
        });
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity < 1) {
          get().removeItem(productId, size);
          return;
        }
        set({
          items: get().items.map(item =>
            item.product.id === productId && item.selectedSize === size
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      closeCart: () => set({ isOpen: false }),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    { name: 'jewelry-cart' }
  )
);
