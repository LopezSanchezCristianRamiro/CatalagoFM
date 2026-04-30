// screens/perfil/PefilScreen.tsx
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
import { usePedidos } from "./hooks/usePedidos";
import type { Pedido } from "./types/pedido.types";

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

// Componente separado para detalle (necesario para animaciones de Reanimated)
function DetallePedido({ item }: { item: Pedido }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      className=" px-4 pb-4 overflow-hidden"
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
            {/* Contenedor de imagen con dimensiones fijas */}
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

            {/* Información del producto */}
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

export default function PerfilScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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

  // ---------- estados de carga y no autenticado (sin cambios) ----------
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
            onPress={() => router.replace("/login")}
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
          className="bg-white rounded-xl border border-border mb-4 overflow-hidden shadow-soft"
        >
          {/* Cabecera */}
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
                {/* Icono de expandir/colapsar */}
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

          {/* Sección expandible con animación */}
          {isExpanded && <DetallePedido item={item} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View className="mb-6">
      {/* Avatar */}
      <View className="w-24 h-24 bg-muted rounded-full items-center justify-center self-center mb-6 mt-20">
        <ThemedText className="text-3xl font-bold text-muted-foreground">
          {user.nombres?.charAt(0)?.toUpperCase() ?? "U"}
        </ThemedText>
      </View>

      <ThemedText className="text-2xl font-bold text-center mb-2">
        {user.nombres}
      </ThemedText>
      <ThemedText className="text-base text-muted-foreground text-center mb-6">
        @{user.nombreUsuario}
      </ThemedText>

      {/* Tarjeta de información */}
      <View className="bg-white rounded-xl border border-border p-4 mb-6">
        <View className="flex-row justify-between py-2 border-b border-border">
          <ThemedText className="text-sm font-medium">Correo</ThemedText>
          <ThemedText className="text-sm text-muted-foreground">
            {user.correo}
          </ThemedText>
        </View>
        <View className="flex-row justify-between py-2">
          <ThemedText className="text-sm font-medium">Rol</ThemedText>
          <ThemedText className="text-sm text-muted-foreground">
            {user.rol}
          </ThemedText>
        </View>
      </View>

      {/* Botón cerrar sesión */}
      <TouchableOpacity
        className={`btn-tap-active h-12 bg-primary rounded-lg items-center justify-center mb-6 ${loggingOut ? "opacity-70" : ""}`}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText className="text-primary-foreground text-base font-semibold">
            Cerrar sesión
          </ThemedText>
        )}
      </TouchableOpacity>

      {/* Encabezado de lista de pedidos */}
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
              <ThemedText className="text-sm text-primary">
                Actualizar
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <ThemedText className="text-status-error text-base mt-3">
        {pedidosError}
      </ThemedText>
      <TouchableOpacity
        onPress={clearAndRefetch}
        className="mt-3 flex-row items-center"
      >
        <Ionicons name="refresh" size={18} color="#7C3AED" />
        <ThemedText className="text-primary font-semibold ml-1">
          Reintentar
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 w-full max-w-lg mx-auto px-6">
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.idPedido.toString()}
          renderItem={renderPedido}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            pedidosLoading ? null : pedidosError ? renderError() : renderEmpty()
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
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
});
