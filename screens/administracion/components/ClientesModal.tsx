import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Pedido } from "../types/pedido.types";
import PedidoCard from "./PedidoCard";

type Cliente = {
  id: number;
  nombre: string;
  correo?: string;
  pedidos: Pedido[];
};

function ClientesModal({
  visible,
  pedidos,
  onClose,
  onEstadoChange,
}: {
  visible: boolean;
  pedidos: Pedido[];
  onClose: () => void;
  onEstadoChange?: (idPedido: number, estado: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);

  const clientes = useMemo(() => {
    const mapa = new Map<number, Cliente>();

    pedidos.forEach((pedido) => {
      const usuario = pedido.usuario;

      if (!usuario?.idUsuario) return;
      if (usuario.idRol === 1) return;

      const id = usuario.idUsuario;

      if (!mapa.has(id)) {
        mapa.set(id, {
          id,
          nombre:
            usuario.nombre ||
            usuario.nombres ||
            usuario.name ||
            usuario.correo ||
            "Sin nombre",
          correo: usuario.correo,
          pedidos: [],
        });
      }

      mapa.get(id)!.pedidos.push(pedido);
    });

    return Array.from(mapa.values());
  }, [pedidos]);

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = search.trim().toLowerCase();

    return (
      texto === "" ||
      cliente.nombre.toLowerCase().includes(texto) ||
      cliente.correo?.toLowerCase().includes(texto)
    );
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 justify-center px-4">
        <View className="bg-white rounded-3xl max-h-[85%] overflow-hidden">
          <View className="p-5 border-b border-gray-200 flex-row justify-between items-center">
            <View className="flex-1 pr-3">
              <ThemedText className="text-xl font-bold text-[#141442]">
                {clienteSeleccionado
                  ? clienteSeleccionado.nombre
                  : "Clientes"}
              </ThemedText>

              <ThemedText className="text-gray-500 mt-1">
                {clienteSeleccionado
                  ? "Historial de compras"
                  : "Cuentas activas"}
              </ThemedText>
            </View>

            {clienteSeleccionado ? (
              <Pressable
                onPress={() => setClienteSeleccionado(null)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
              >
                <Ionicons name="arrow-back" size={21} color="#141442" />
              </Pressable>
            ) : null}

            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#141442" />
            </Pressable>
          </View>

          {!clienteSeleccionado ? (
            <View className="p-4">
              <TextInput
                placeholder="Buscar cliente..."
                value={search}
                onChangeText={setSearch}
                className="bg-gray-100 px-4 py-3 rounded-xl text-[#141442]"
                placeholderTextColor="#9ca3af"
              />
            </View>
          ) : null}

          <ScrollView className="p-5">
            {!clienteSeleccionado ? (
              clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => (
                  <Pressable
                    key={cliente.id}
                    onPress={() => setClienteSeleccionado(cliente)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 mb-4"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 pr-3">
                        <ThemedText className="text-lg font-bold text-[#141442]">
                          {cliente.nombre}
                        </ThemedText>

                        {cliente.correo ? (
                          <ThemedText className="text-gray-500 mt-1">
                            {cliente.correo}
                          </ThemedText>
                        ) : null}
                      </View>

                      <View className="items-end">
                        <ThemedText className="text-purple-600 font-bold">
                          {cliente.pedidos.length} pedidos
                        </ThemedText>

                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#141442"
                        />
                      </View>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View className="py-14 items-center">
                  <Ionicons name="people-outline" size={42} color="#9ca3af" />
                  <ThemedText className="text-[#141442] font-bold mt-3">
                    No hay clientes
                  </ThemedText>
                </View>
              )
            ) : (
              clienteSeleccionado.pedidos.map((pedido) => (
                <PedidoCard
                  key={pedido.idPedido}
                  pedido={pedido}
                  onEstadoChange={onEstadoChange}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default ClientesModal;