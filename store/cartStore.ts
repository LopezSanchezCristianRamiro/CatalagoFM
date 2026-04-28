import { create } from "zustand";

// Definimos una interfaz base. Si ya tienes producto.types.ts,
// puedes importarla en tu proyecto real.
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  categoriaId: string;
}

export interface CartItem extends Producto {
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (producto: Producto) => void;
  removeFromCart: (productoId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addToCart: (producto) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === producto.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          ),
        };
      }
      return { items: [...state.items, { ...producto, cantidad: 1 }] };
    }),
  removeFromCart: (productoId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productoId),
    })),
  clearCart: () => set({ items: [] }),
}));
