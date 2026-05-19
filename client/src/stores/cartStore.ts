import { create } from 'zustand';

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const loadCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

export const useCartStore = create<CartState>()((set, get) => ({
  items: loadCart(),

  addItem: (item) => {
    const items = get().items;
    const existing = items.find((i) => i.product === item.product);
    if (existing) {
      const updated = items.map((i) =>
        i.product === item.product ? { ...i, quantity: i.quantity + 1 } : i
      );
      set({ items: updated });
      saveCart(updated);
    } else {
      const updated = [...items, { ...item, quantity: 1 }];
      set({ items: updated });
      saveCart(updated);
    }
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.product !== productId);
    set({ items: updated });
    saveCart(updated);
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    const updated = get().items.map((i) =>
      i.product === productId ? { ...i, quantity } : i
    );
    set({ items: updated });
    saveCart(updated);
  },

  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem('cart');
  },
}));
