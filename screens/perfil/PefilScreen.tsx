// screens/perfil/PerfilScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../contexts/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";
import { EditarTelefonoModal } from "./components/EditarTelefonoModal";
import { PerfilInfo } from "./components/PerfilInfo";
import { usePedidos } from "./hooks/usePedidos";
import type { Pedido } from "./types/pedido.types";

// -------------------------------------------------------
// ESTADO COLOR & LABEL
// -------------------------------------------------------
const estadoColor: Record<Pedido["estado"], string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pagado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
  entregado: "bg-blue-100 text-blue-800",
};

const estadoLabel: Record<Pedido["estado"], string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  cancelado: "Cancelado",
  entregado: "Entregado",
};

// -------------------------------------------------------
// DETALLE DEL PEDIDO
// -------------------------------------------------------
function DetallePedido({ item }: { item: Pedido }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      className="px-4 pb-4 overflow-hidden"
    >
      <View className="border-t border-border pt-3 mt-1" />
      <ThemedText className="text-xs text-center font-semibold mb-2 text-foreground">
        Productos
      </ThemedText>

      {item.detalles.map((det) => {
        const imgSrc = det.producto?.fotos?.[0]?.urlFoto;
        return (
          <View
            key={det.idDetallePedido}
            className="flex-row items-center px-5 py-2 pb-2 border-b border-border/50 last:border-b-0"
          >
            <View className="w-12 h-12 rounded-lg bg-muted overflow-hidden mr-3">
              {imgSrc ? (
                <Image
                  source={{ uri: imgSrc }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="image-outline" size={18} color="#9CA3AF" />
                </View>
              )}
            </View>

            <View className="flex-1">
              <ThemedText className="text-sm font-medium text-foreground">
                {det.producto.nombre}
              </ThemedText>
              <ThemedText className="text-xs text-muted-foreground">
                {det.cantidad} x Bs. {det.precioUnitario}
              </ThemedText>
            </View>

            <ThemedText className="text-sm font-bold text-primary ml-2">
              Bs. {det.subTotal}
            </ThemedText>
          </View>
        );
      })}
    </Animated.View>
  );
}

// -------------------------------------------------------
// PANTALLA PRINCIPAL
// -------------------------------------------------------
export default function PerfilScreen() {
  const { user, loading: authLoading, logout, updateProfile } = useAuth();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [loggingOut, setLoggingOut] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [savingTelefono, setSavingTelefono] = useState(false);

  const {
    pedidos,
    loading: pedidosLoading,
    error: pedidosError,
    clearAndRefetch,
  } = usePedidos();

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleGuardarTelefono = useCallback(
    async (nuevoTelefono: string) => {
      setSavingTelefono(true);
      try {
        await updateProfile({ telefono: nuevoTelefono });
        setModalVisible(false);
        Toast.show({
          type: "success",
          text1: "Teléfono actualizado",
          text2: "Tu número fue guardado correctamente",
        });
      } catch {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudo actualizar el teléfono",
        });
      } finally {
        setSavingTelefono(false);
      }
    },
    [updateProfile],
  );

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Sesión cerrada",
        text2: "Vuelve pronto",
      });
      router.replace("/catalogo");
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo cerrar sesión",
      });
    } finally {
      setLoggingOut(false);
    }
  }, [logout, router]);

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <View className="w-full max-w-md items-center">
          <ThemedText className="text-xl">No has iniciado sesión</ThemedText>
          <TouchableOpacity
            className="mt-4 h-12 bg-primary rounded-lg items-center justify-center px-6"
            onPress={() => router.push("/login")}
          >
            <ThemedText className="text-primary-foreground text-base font-semibold">
              Iniciar Sesión
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderPedido = ({ item, index }: { item: Pedido; index: number }) => {
    const isExpanded = expandedId === item.idPedido;
    return (
      <Animated.View entering={FadeInUp.duration(300).delay(index * 80)}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleExpand(item.idPedido)}
          className="bg-white rounded-xl border border-border mb-4 overflow-hidden shadow-sm"
        >
          <View className="p-4">
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText className="text-sm font-bold text-foreground">
                Pedido #{item.idPedido}
              </ThemedText>
              <View className="flex-row items-center space-x-2">
                <View
                  className={`px-3 py-1 rounded-full ${estadoColor[item.estado].split(" ")[0]}`}
                >
                  <ThemedText
                    className={`text-xs font-semibold ${estadoColor[item.estado].split(" ")[1]}`}
                  >
                    {estadoLabel[item.estado]}
                  </ThemedText>
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#6B7280"
                />
              </View>
            </View>

            <View className="flex-row justify-between mt-1">
              <ThemedText className="text-xs text-muted-foreground">
                {new Date(item.fechaCreacion).toLocaleDateString("es-BO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </ThemedText>
              {item.total && (
                <ThemedText className="text-sm font-bold text-primary">
                  Bs. {item.total}
                </ThemedText>
              )}
            </View>

            {item.tipoPago && (
              <View className="mt-2 flex-row items-center">
                <ThemedText className="text-xs text-muted-foreground">
                  Pago:{" "}
                </ThemedText>
                <ThemedText className="text-xs font-medium capitalize text-foreground">
                  {item.tipoPago.replace("_", " ")}
                </ThemedText>
              </View>
            )}

            {item.observacion && (
              <ThemedText className="mt-1 text-xs text-muted-foreground italic">
                “{item.observacion}”
              </ThemedText>
            )}
          </View>

          {isExpanded && <DetallePedido item={item} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center py-10">
      <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
      <ThemedText className="text-muted-foreground text-base mt-3">
        Aún no tienes pedidos
      </ThemedText>
    </View>
  );

  const renderError = () => (
    <View className="items-center py-10">
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <ThemedText className="text-red-500 text-base mt-3">
        {pedidosError}
      </ThemedText>
      <TouchableOpacity
        onPress={clearAndRefetch}
        className="mt-3 flex-row items-center bg-red-50 px-4 py-2 rounded-full"
      >
        <Ionicons name="refresh" size={18} color="#EF4444" />
        <ThemedText className="text-red-600 font-semibold ml-2">
          Reintentar
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  // Cabecera original para la versión móvil
  const ListaPedidosHeader = () => (
    <View className="flex-row items-center justify-between mb-3">
      <ThemedText className="text-lg font-bold text-foreground">
        Mis Pedidos
      </ThemedText>
      <TouchableOpacity
        onPress={clearAndRefetch}
        disabled={pedidosLoading}
        className="flex-row items-center space-x-1"
      >
        {pedidosLoading ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : (
          <>
            <Ionicons name="refresh" size={16} color="#7C3AED" />
            <ThemedText className="text-sm text-primary font-medium">
              Actualizar
            </ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // ========== LAYOUT RESPONSIVO ==========
  return (
    <View className="flex-1 bg-background">
      <EditarTelefonoModal
        visible={modalVisible}
        telefonoActual={user.telefono ?? ""}
        onClose={() => setModalVisible(false)}
        onConfirm={handleGuardarTelefono}
        saving={savingTelefono}
      />

      {isDesktop ? (
        // -----------------------------------------------
        // ESCRITORIO: Layout Moderno Estilo Dashboard
        // -----------------------------------------------
        <View className="flex-1 flex-row max-w-7xl mx-auto w-full px-8 py-10 gap-8">
          {/* PANEL IZQUIERDO: Tarjeta Flotante de Perfil */}
          <View className="w-[320px] bg-white rounded-3xl p-6 shadow-sm border border-border h-fit self-start">
            <PerfilInfo
              user={user}
              loggingOut={loggingOut}
              onEditTelefono={() => setModalVisible(true)}
              onLogout={handleLogout}
              compact={false}
            />
          </View>

          {/* PANEL DERECHO: Tarjeta Principal de Pedidos */}
          <View className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-border">
            {/* Cabecera con título y botón alineados horizontalmente */}
            <View className="flex-row justify-between items-start mb-6 pb-5 border-b border-border/50">
              <View>
                <ThemedText className="text-3xl font-extrabold text-foreground tracking-tight">
                  Historial de Pedidos
                </ThemedText>
                <ThemedText className="text-sm text-muted-foreground mt-1">
                  Administra y revisa el detalle de tus compras recientes.
                </ThemedText>
              </View>

              {/* Botón de actualizar al lado del título */}
              <TouchableOpacity
                onPress={clearAndRefetch}
                disabled={pedidosLoading}
                className="flex-row items-center bg-primary/10 px-5 py-2.5 rounded-2xl"
              >
                {pedidosLoading ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={18} color="#7C3AED" />
                    <ThemedText className="text-sm font-bold text-primary ml-2">
                      Actualizar Datos
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <FlatList
              data={pedidos}
              keyExtractor={(item) => item.idPedido.toString()}
              renderItem={renderPedido}
              ListEmptyComponent={
                pedidosLoading
                  ? null
                  : pedidosError
                    ? renderError()
                    : renderEmpty()
              }
              contentContainerStyle={{ paddingBottom: 32 }}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={clearAndRefetch}
                  tintColor="#7C3AED"
                  colors={["#7C3AED"]}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      ) : (
        // -----------------------------------------------
        // MÓVIL: layout clásico (una sola columna)
        // -----------------------------------------------
        <View className="flex-1 w-full max-w-lg mx-auto px-6">
          <FlatList
            data={pedidos}
            keyExtractor={(item) => item.idPedido.toString()}
            renderItem={renderPedido}
            ListHeaderComponent={
              <>
                <View className="mb-6 mt-4">
                  <PerfilInfo
                    user={user}
                    loggingOut={loggingOut}
                    onEditTelefono={() => setModalVisible(true)}
                    onLogout={handleLogout}
                  />
                </View>
                <ListaPedidosHeader />
              </>
            }
            ListEmptyComponent={
              pedidosLoading
                ? null
                : pedidosError
                  ? renderError()
                  : renderEmpty()
            }
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={clearAndRefetch}
                tintColor="#7C3AED"
                colors={["#7C3AED"]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
});
