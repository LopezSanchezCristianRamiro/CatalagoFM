import { useCallback, useRef, useState } from "react";
import { httpClient } from "../../../http/httpClient";
import {
  CategoriaCatalogo,
  PaginatedResponseCatalogo,
  ProductoCatalogo,
} from "../types/catalogo.types";

const cacheProductos: Record<string, ProductoCatalogo[]> = {};
const cacheHasMore: Record<string, boolean> = {};

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

  filtersRef.current = { searchQuery, categoriaActiva };

  const getCacheKey = (sq: string, ca: number | null, p: number) =>
    `${sq}_${ca ?? "all"}_${p}`;

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
        "/api/catalogo?soloPromociones=1&limit=12",
        "Error al cargar promociones",
      );
      setPromociones(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProductos = useCallback(async (currentPage: number, isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const { searchQuery: sq, categoriaActiva: ca } = filtersRef.current;
    const cacheKey = getCacheKey(sq, ca, currentPage);

    if (cacheProductos[cacheKey] && !isRefresh) {
      if (currentPage === 1) {
        setProductos(cacheProductos[cacheKey]);
      } else {
        setProductos((prev) => [...prev, ...cacheProductos[cacheKey]]);
      }
      setHasMore(cacheHasMore[cacheKey] ?? false);
      pageRef.current = currentPage;
      setLoadingProductos(false);
      setLoadingInit(false);
      setApplyingFilters(false);
      return;
    }

    setLoadingProductos(true);

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
        controller.signal,
      );

      if (controller.signal.aborted) return;

      const newData = res.data || [];
      const morePages = currentPage < res.last_page;

      cacheProductos[cacheKey] = newData;
      cacheHasMore[cacheKey] = morePages;

      if (isRefresh || currentPage === 1) {
        setProductos(newData);
      } else {
        setProductos((prev) => [...prev, ...newData]);
      }

      setHasMore(morePages);
      pageRef.current = currentPage;
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      console.error(error);
    } finally {
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
    Object.keys(cacheProductos).forEach((k) => delete cacheProductos[k]);
    Object.keys(cacheHasMore).forEach((k) => delete cacheHasMore[k]);

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
    fetchProductos(1, false);
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