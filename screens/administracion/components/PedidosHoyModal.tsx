import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Pedido } from "../types/pedido.types";
import PedidoCard from "./PedidoCard";

function esPedidoDeHoy(fecha: string) {
  const hoy = new Date();
  const fechaPedido = new Date(fecha);

  return (
    hoy.getFullYear() === fechaPedido.getFullYear() &&
    hoy.getMonth() === fechaPedido.getMonth() &&
    hoy.getDate() === fechaPedido.getDate()
  );
}

export default function PedidosHoyModal({
  visible,
  pedidos,
  isMobile,
  onClose,
  onEstadoChange,
}: {
  visible: boolean;
  pedidos: Pedido[];
  isMobile?: boolean;
  onClose: () => void;
  onEstadoChange?: (idPedido: number, estado: string) => Promise<void>;
}) {
  const pedidosHoy = pedidos.filter((pedido) =>
    esPedidoDeHoy(pedido.fechaCreacion)
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 justify-center px-4">
        <View className="bg-white rounded-3xl max-h-[85%] overflow-hidden">
          <View className="p-5 border-b border-gray-200 flex-row justify-between items-center">
            <View>
              <ThemedText className="text-xl font-bold text-[#141442]">
                Pedidos de Hoy
              </ThemedText>
              <ThemedText className="text-gray-500 mt-1">
                {pedidosHoy.length} pedidos registrados hoy
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#141442" />
            </Pressable>
          </View>

          <ScrollView className="p-5">
            {pedidosHoy.length > 0 ? (
              pedidosHoy.map((pedido) => (
                <PedidoCard
                  key={pedido.idPedido}
                  pedido={pedido}
                  isMobile={isMobile}
                  onEstadoChange={onEstadoChange}
                />
              ))
            ) : (
              <View className="py-14 items-center">
                <Ionicons name="bag-outline" size={42} color="#9ca3af" />
                <ThemedText className="text-[#141442] font-bold mt-3">
                  No hay pedidos hoy
                </ThemedText>
                <ThemedText className="text-gray-500 text-center mt-1">
                  Cuando se registren pedidos hoy aparecerán aquí.
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}