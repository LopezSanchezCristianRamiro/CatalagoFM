export type Categoria = {
  idCategoria: number;
  nombre: string;
};

export type FotoProducto = {
  idFotoProducto: number;
  urlFoto: string;
  idProducto: number;
};

export type Producto = {
  idProducto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioDescuento?: number | null;
  idCategoria: number;

  estado?: "activado" | "desactivado";

  categoria?: Categoria;
  fotos?: FotoProducto[];
};

export type ProductoPayload = {
  nombre: string;
  descripcion: string;
  precio: number;
  precioDescuento?: number | null;
  idCategoria: number;

  estado?: "activado" | "desactivado";

  urlFotos?: string[];
};

export type CategoriaPayload = {
  nombre: string;
};