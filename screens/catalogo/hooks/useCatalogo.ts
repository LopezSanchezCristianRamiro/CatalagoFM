import { useCallback, useState } from "react";
import { httpClient } from "../../../http/httpClient";
import {
  CategoriaCatalogo,
  PaginatedResponseCatalogo,
  ProductoCatalogo,
} from "../types/catalogo.types";

export function useCatalogo() {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [promociones, setPromociones] = useState<ProductoCatalogo[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);

  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // nuevo estado para saber si estamos filtrando (buscar/categoría)
  const [applyingFilters, setApplyingFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);

  const fetchCategorias = async () => {
    try {
      const res = await httpClient.getAuth<CategoriaCatalogo[]>(
        "/api/categorias",
        "Error al cargar categorías",
      );
      setCategorias(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPromociones = async () => {
    try {
      const res = await httpClient.getAuth<
        PaginatedResponseCatalogo<ProductoCatalogo>
      >(
        "/api/catalogo?soloPromociones=1&limit=5",
        "Error al cargar promociones",
      );
      setPromociones(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProductos = async (currentPage: number, isRefresh = false) => {
    if (loadingProductos) return;
    setLoadingProductos(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (categoriaActiva)
        params.append("idCategoria", categoriaActiva.toString());

      const res = await httpClient.getAuth<
        PaginatedResponseCatalogo<ProductoCatalogo>
      >(`/api/catalogo?${params.toString()}`, "Error al cargar productos");

      const newData = res.data || [];

      if (isRefresh) {
        setProductos(newData);
      } else {
        setProductos((prev) => [...prev, ...newData]);
      }

      setHasMore(currentPage < res.last_page);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProductos(false);
      setLoadingInit(false);
      setRefreshing(false);
      setApplyingFilters(false);
    }
  };

  const loadMore = () => {
    if (!loadingProductos && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProductos(nextPage);
    }
  };

  const refreshAll = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchCategorias();
    fetchPromociones();
    fetchProductos(1, true);
  }, [searchQuery, categoriaActiva]);

  // Limpia productos y busca desde página 1 al aplicar filtros
  const applyFilters = () => {
    setApplyingFilters(true);
    setProductos([]); // limpia inmediatamente para mostrar spinner
    setPage(1);
    fetchProductos(1, true);
  };

  return {
    productos,
    promociones,
    categorias,
    loadingInit,
    loadingProductos,
    refreshing,
    applyingFilters, // nuevo
    searchQuery,
    setSearchQuery,
    categoriaActiva,
    setCategoriaActiva,
    loadMore,
    refreshAll,
    applyFilters,
    fetchInitialData: refreshAll,
  };
}
