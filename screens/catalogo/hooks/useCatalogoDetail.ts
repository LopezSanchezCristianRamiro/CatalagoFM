import { useCallback, useEffect, useState } from "react";
import { httpClient } from "../../../http/httpClient";
import { ProductoCatalogo } from "../types/catalogo.types";

export function useCatalogoDetail(idProducto: number) {
  const [producto, setProducto] = useState<ProductoCatalogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await httpClient.getAuth<ProductoCatalogo>(
        `/api/catalogo/${idProducto}`,
        "No se pudo cargar el producto",
      );
      setProducto(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [idProducto]);

  useEffect(() => {
    fetchProducto();
  }, [fetchProducto]);

  return { producto, loading, error, refetch: fetchProducto };
}
