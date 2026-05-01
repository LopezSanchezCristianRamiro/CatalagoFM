export interface FotoCatalogo {
  idFotoProducto: number;
  urlFoto: string | null;
  idProducto: number;
}

export interface CategoriaCatalogo {
  idCategoria: number; // Usamos number porque así viene de la BD
  nombre: string;
}

export interface ProductoCatalogo {
  idProducto: number;
  nombre: string;
  descripcion: string | null; // Cambiado a null para aceptar lo que manda el Backend
  precio: number;
  precioDescuento: number | null;
  idCategoria: number | null;
  categoria?: CategoriaCatalogo;
  fotos: FotoCatalogo[];
  estado?: "activado" | "desactivado";
}

export interface PaginatedResponseCatalogo<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
}
