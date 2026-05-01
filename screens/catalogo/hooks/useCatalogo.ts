import { useCallback, useRef, useState } from "react";
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
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const filtersRef = useRef<{ searchQuery: string; categoriaActiva: number | null }>({
    searchQuery: "",
    categoriaActiva: null,
  });
  const pageRef = useRef(1);

  // Mantén filtersRef sincronizado en cada render
  filtersRef.current = { searchQuery, categoriaActiva };

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
      const res = await httpClient.getAuth<PaginatedResponseCatalogo<ProductoCatalogo>>(
        "/api/catalogo?soloPromociones=1&limit=1000",
        "Error al cargar promociones",
      );
      setPromociones(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProductos = useCallback(async (currentPage: number, isRefresh = false) => {
    // Cancela el request anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingProductos(true);

    const { searchQuery: sq, categoriaActiva: ca } = filtersRef.current;

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
      });
      if (sq) params.append("search", sq);
      if (ca !== null) params.append("idCategoria", ca.toString());

      const res = await httpClient.getAuth<PaginatedResponseCatalogo<ProductoCatalogo>>(
        `/api/catalogo?${params.toString()}`,
        "Error al cargar productos",
        controller.signal, // <-- signal para cancelar a nivel de red
      );

      // Si fue abortado mientras esperaba, descartamos
      if (controller.signal.aborted) return;

      const newData = res.data || [];

      if (isRefresh) {
        setProductos(newData);
      } else {
        setProductos((prev) => [...prev, ...newData]);
      }

      setHasMore(currentPage < res.last_page);
      pageRef.current = currentPage;
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      console.error(error);
    } finally {
      // Solo toca el estado si este controller sigue siendo el activo
      if (abortControllerRef.current === controller) {
        setLoadingProductos(false);
        setLoadingInit(false);
        setRefreshing(false);
        setApplyingFilters(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingProductos && hasMore) {
      const nextPage = pageRef.current + 1;
      fetchProductos(nextPage, false);
    }
  }, [loadingProductos, hasMore, fetchProductos]);

  const refreshAll = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 1;
    setPage(1);
    fetchCategorias();
    fetchPromociones();
    fetchProductos(1, true);
  }, [fetchProductos]);

  const applyFilters = useCallback(() => {
    setApplyingFilters(true);
    setProductos([]);
    pageRef.current = 1;
    setPage(1);
    fetchProductos(1, true);
  }, [fetchProductos]);

  return {
    productos,
    promociones,
    categorias,
    loadingInit,
    loadingProductos,
    refreshing,
    applyingFilters,
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