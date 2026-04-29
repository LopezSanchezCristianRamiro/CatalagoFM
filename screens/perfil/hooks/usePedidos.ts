import { useCallback, useEffect, useState } from "react";
import { httpClient } from "../../../http/httpClient";
import type { Pedido } from "../types/pedido.types";

interface UsePedidosReturn {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearAndRefetch: () => void;
}

export function usePedidos(): UsePedidosReturn {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await httpClient.getAuth<{
        message: string;
        pedidos: Pedido[];
      }>("/api/mis-pedidos");
      setPedidos(data.pedidos);
    } catch (err: any) {
      setError(err?.message || "Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const refetch = useCallback(async () => {
    await fetchPedidos();
  }, [fetchPedidos]);

  const clearAndRefetch = useCallback(async () => {
    setPedidos([]);
    setError(null);
    await fetchPedidos();
  }, [fetchPedidos]);

  return { pedidos, loading, error, refetch, clearAndRefetch };
}
