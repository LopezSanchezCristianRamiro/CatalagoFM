import { useCallback, useEffect, useState } from "react";
import { productoService } from "../services/productoService";
import { Categoria, Producto } from "../types/producto.types";

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

      const [productosData, categoriasData] = await Promise.all([
        productoService.getProductos(),
        productoService.getCategorias(),
      ]);

      setProductos(productosData);
      setCategorias(categoriasData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    productos,
    categorias,
    loading,
    refetch: cargarDatos,
  };
}