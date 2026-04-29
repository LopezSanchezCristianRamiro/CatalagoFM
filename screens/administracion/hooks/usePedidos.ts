import { useEffect, useState } from "react";
import { httpClient } from "../../../http/httpClient";
import { Pedido } from "../types/pedido.types";

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      setLoading(true);

      const response = await httpClient.getAuth<{ pedidos: Pedido[] }>(
        "/api/admin/pedidos"
      );

      setPedidos(response.pedidos);
    } catch (error) {
      console.error("Error pedidos", error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (idPedido: number, estado: string) => {
    try {
      await httpClient.putAuth(`/api/admin/pedidos/${idPedido}/estado`, {
        estado,
      });

      await fetchPedidos();
    } catch (error) {
      console.error("Error actualizando estado", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  return {
    pedidos,
    loading,
    refetch: fetchPedidos,
    actualizarEstado,
  };
}