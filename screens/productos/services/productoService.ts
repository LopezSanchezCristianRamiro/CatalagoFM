import { httpClient } from "../../../http/httpClient";
import {
    Categoria,
    CategoriaPayload,
    Producto,
    ProductoPayload,
} from "../types/producto.types";

export const productoService = {
  getCategorias: () =>
    httpClient.getAuth<Categoria[]>("/api/categorias", "Error al cargar categorías"),

  createCategoria: (body: CategoriaPayload) =>
    httpClient.postAuth("/api/categorias", body, "Error al crear categoría"),

  updateCategoria: (id: number, body: CategoriaPayload) =>
    httpClient.putAuth(`/api/categorias/${id}`, body, "Error al actualizar categoría"),

  deleteCategoria: (id: number) =>
    httpClient.deleteAuth(`/api/categorias/${id}`, "Error al eliminar categoría"),

  getProductos: () =>
    httpClient.getAuth<Producto[]>("/api/productos", "Error al cargar productos"),

  createProducto: (body: ProductoPayload) =>
    httpClient.postAuth("/api/productos", body, "Error al crear producto"),

  updateProducto: (id: number, body: ProductoPayload) =>
    httpClient.putAuth(`/api/productos/${id}`, body, "Error al actualizar producto"),

  deleteProducto: (id: number) =>
    httpClient.deleteAuth(`/api/productos/${id}`, "Error al eliminar producto"),
};