import { create } from "zustand";

export interface ProductoCart {
  idProducto: number;
  nombre: string;
  precio: number;
  precioDescuento: number | null;
  fotos: { urlFoto: string | null }[];
}

export interface CartItem extends ProductoCart {
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (producto: ProductoCart) => void;
  removeFromCart: (idProducto: number) => void;
  updateCantidad: (idProducto: number, cantidad: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addToCart: (producto) =>
    set((state) => {
      const existe = state.items.find((i) => i.idProducto === producto.idProducto);
      if (existe) {
        return {
          items: state.items.map((i) =>
            i.idProducto === producto.idProducto
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...producto, cantidad: 1 }] };
    }),

  removeFromCart: (idProducto) =>
    set((state) => ({
      items: state.items.filter((i) => i.idProducto !== idProducto),
    })),

  updateCantidad: (idProducto, cantidad) =>
    set((state) => ({
      items:
        cantidad <= 0
          ? state.items.filter((i) => i.idProducto !== idProducto)
          : state.items.map((i) =>
              i.idProducto === idProducto ? { ...i, cantidad } : i
            ),
    })),

  clearCart: () => set({ items: [] }),

  getTotal: () =>
    get().items.reduce((acc, item) => {
      const precio = item.precioDescuento ?? item.precio;
      return acc + precio * item.cantidad;
    }, 0),
}));