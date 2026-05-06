import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { httpClient } from "../http/httpClient";
import { useCartAnimation } from "../screens/catalogo/components/CartAnimationContext";
import { useCartStore } from "../store/cartStore";
import { ThemedText } from "./ThemedText";

interface NavbarProps {
  isAdmin: boolean;
}

type UsuarioPedido = {
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  correo?: string;
  email?: string;
};

type Pedido = {
  idPedido: number;
  estado?: string;
  tipoPago?: string;
  total?: number;
  montoTotal?: number;
  fechaCreacion?: string;
  created_at?: string;
  usuario?: UsuarioPedido;
};

type PedidosResponse = {
  pedidos: Pedido[];
};

type Notificacion = {
  id: string;
  idPedido: number;
  tipo: "pedido" | "qr";
  titulo: string;
  mensaje: string;
  tiempo: string;
  fecha: string;
};

const CENTER_ROUTES = [
  {
    name: "catalogo",
    label: "Catálogo",
    icon: "grid-outline",
    adminOnly: false,
  },
  {
    name: "productos",
    label: "Productos",
    icon: "add-circle-outline",
    adminOnly: true,
  },
  {
    name: "administracion",
    label: "Dueño",
    icon: "bar-chart-outline",
    adminOnly: true,
  },
];

function tiempoTranscurrido(fecha?: string) {
  if (!fecha) return "Sin fecha";

  const fechaPedido = new Date(fecha);
  const ahora = new Date();

  if (Number.isNaN(fechaPedido.getTime())) return "Sin fecha";

  const diffMs = ahora.getTime() - fechaPedido.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras} h`;
  if (diffDias === 1) return "Hace 1 día";

  return `Hace ${diffDias} días`;
}

function obtenerNombreCliente(usuario?: UsuarioPedido) {
  if (!usuario) return "Cliente";

  const nombreCompleto = [
    usuario.nombre,
    usuario.nombres,
    usuario.apellido,
    usuario.apellidos,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombreCompleto || usuario.correo || usuario.email || "Cliente";
}

function obtenerFechaPedido(pedido?: Pedido | null) {
  if (!pedido) return "";
  return pedido.fechaCreacion || pedido.created_at || "";
}

function obtenerTotalPedido(pedido?: Pedido | null) {
  if (!pedido) return 0;
  return Number(pedido.total || pedido.montoTotal || 0);
}

function normalizarTipoPago(tipoPago?: string) {
  return String(tipoPago || "").toLowerCase();
}

function mostrarTipoPago(tipoPago?: string) {
  const tipo = normalizarTipoPago(tipoPago);

  if (tipo.includes("qr")) return "Pago por QR";
  if (tipo.includes("contra")) return "Contra entrega";
  if (tipo.includes("tarjeta")) return "Tarjeta";

  return tipoPago || "No definido";
}

export function Navbar({ isAdmin }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPedidoDetalle, setShowPedidoDetalle] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const cartTotal = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0),
  );

  const { cartRef } = useCartAnimation();

  const activeColor = "#7C3AED";
  const inactiveColor = "#6B7280";

  const filteredCenter = CENTER_ROUTES.filter(
    (r) => !r.adminOnly || isAdmin,
  );

  const cargarPedidosAdmin = async () => {
    if (!isAdmin) return;

    try {
      setLoadingNotifications(true);

      const response = await httpClient.getAuth<PedidosResponse>(
        "/api/admin/pedidos",
      );

      setPedidos(response.pedidos || []);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    cargarPedidosAdmin();

    if (!isAdmin) return;

    const interval = setInterval(() => {
      cargarPedidosAdmin();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const notifications = useMemo<Notificacion[]>(() => {
    return pedidos
      .slice()
      .sort((a, b) => {
        const fechaA = new Date(obtenerFechaPedido(a)).getTime();
        const fechaB = new Date(obtenerFechaPedido(b)).getTime();

        return fechaB - fechaA;
      })
      .slice(0, 20)
      .flatMap((pedido) => {
        const fecha = obtenerFechaPedido(pedido);
        const cliente = obtenerNombreCliente(pedido.usuario);
        const total = obtenerTotalPedido(pedido);
        const tipoPago = normalizarTipoPago(pedido.tipoPago);

        const lista: Notificacion[] = [
          {
            id: `pedido-${pedido.idPedido}`,
            idPedido: pedido.idPedido,
            tipo: "pedido",
            titulo: `Nuevo pedido #${pedido.idPedido}`,
            mensaje: `${cliente} hizo una compra por Bs. ${total.toFixed(2)}.`,
            tiempo: tiempoTranscurrido(fecha),
            fecha,
          },
        ];

        if (tipoPago.includes("qr")) {
          lista.push({
            id: `qr-${pedido.idPedido}`,
            idPedido: pedido.idPedido,
            tipo: "qr",
            titulo: `Pago por QR #${pedido.idPedido}`,
            mensaje: `${cliente} seleccionó pago por QR por Bs. ${total.toFixed(2)}.`,
            tiempo: tiempoTranscurrido(fecha),
            fecha,
          });
        }

        return lista;
      });
  }, [pedidos]);

  const abrirDetallePedido = (idPedido: number) => {
    const pedido = pedidos.find((p) => p.idPedido === idPedido);

    if (!pedido) return;

    setSelectedPedido(pedido);
    setShowNotifications(false);
    setShowPedidoDetalle(true);
  };

  return (
    <>
      <View className="bg-card w-full h-16 border-b border-border flex-row items-center px-8 justify-between z-50">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/catalogo")}
          className="flex-row items-center"
        >
          <Image
            source={require("../assets/images/logo.jpg")}
            className="w-10 h-10 rounded-md"
            contentFit="cover"
          />

          <ThemedText className="ml-3 text-lg font-bold tracking-tight">
            Streaming App
          </ThemedText>
        </TouchableOpacity>

        <View className="flex-row items-center space-x-1">
          {filteredCenter.map((item) => {
            const isActive = pathname?.includes(item.name);

            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => router.push(`/(tabs)/${item.name}` as any)}
                className={`flex-row items-center px-4 py-2 rounded-lg ${
                  isActive ? "bg-primary/10" : "hover:bg-accent"
                }`}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={isActive ? activeColor : inactiveColor}
                />

                <Text
                  className={`ml-2 text-sm font-semibold ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center space-x-4">

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/carrito")}
            className={`p-2 rounded-full ${
              pathname?.includes("carrito") ? "bg-primary/10" : ""
            }`}
          >
            <View
              ref={cartRef}
              collapsable={false}
              style={{ position: "relative" }}
            >
              <Ionicons
                name="cart-outline"
                size={24}
                color={
                  pathname?.includes("carrito")
                    ? activeColor
                    : "#1f2937"
                }
              />

              {cartTotal > 0 && (
                <View className="absolute -top-2 -right-2 bg-primary rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border-2 border-white">
                  <Text className="text-white text-[9px] font-black">
                    {cartTotal > 99 ? "99+" : cartTotal}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/perfil")}
            className={`flex-row items-center pl-4 pr-2 py-1.5 rounded-full border border-border ${
              pathname?.includes("perfil")
                ? "bg-primary/10 border-primary/20"
                : "bg-secondary/50"
            }`}
          >
            <Text
              className={`mr-2 text-sm font-bold ${
                pathname?.includes("perfil")
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              Perfil
            </Text>

            <View className="bg-primary/20 rounded-full p-1">
              <Ionicons name="person" size={18} color={activeColor} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {isAdmin && isMobile && (
        <TouchableOpacity
          onPress={() => {
            setShowNotifications(true);
            cargarPedidosAdmin();
          }}
          className="absolute right-4 top-20 w-14 h-14 rounded-full bg-white items-center justify-center z-[999] border border-border"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
          }}
        >
          <Ionicons name="notifications-outline" size={26} color="#070b3f" />

          {notifications.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-primary rounded-full min-w-[20px] h-[20px] items-center justify-center px-1 border-2 border-white">
              <Text className="text-white text-[10px] font-black">
                {notifications.length > 9 ? "9+" : notifications.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View className="flex-1 bg-black/40 justify-start items-center pt-4 px-3">
          <View className="w-full max-w-[1380px] max-h-[86%] bg-white rounded-3xl overflow-hidden">
            <View className="px-7 py-6 border-b border-border flex-row items-start justify-between">
              <View>
                <ThemedText className="text-2xl font-black text-[#070b3f]">
                  Notificaciones
                </ThemedText>

                <ThemedText className="mt-2 text-base text-muted-foreground">
                  Pedidos recientes y pagos por QR
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                className="w-14 h-14 rounded-full bg-secondary items-center justify-center"
              >
                <Ionicons name="close" size={30} color="#070b3f" />
              </TouchableOpacity>
            </View>

            {loadingNotifications ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator color={activeColor} />

                <ThemedText className="mt-3 text-muted-foreground">
                  Cargando notificaciones...
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                className="px-7 py-7"
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingBottom: 28 }}
              >
                {notifications.length === 0 ? (
                  <View className="items-center py-16">
                    <Ionicons
                      name="notifications-off-outline"
                      size={48}
                      color="#9CA3AF"
                    />

                    <ThemedText className="mt-3 text-muted-foreground">
                      No tienes notificaciones.
                    </ThemedText>
                  </View>
                ) : (
                  notifications.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => abrirDetallePedido(item.idPedido)}
                      className="mb-5 rounded-2xl border border-border bg-white px-6 py-5"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                          <ThemedText className="text-xl font-black text-[#070b3f]">
                            {item.titulo}
                          </ThemedText>

                          <ThemedText className="mt-3 text-base text-muted-foreground">
                            {item.mensaje}
                          </ThemedText>
                        </View>

                        <View className="flex-row items-center">
                          <ThemedText className="mr-6 text-xl font-black text-primary">
                            {item.tiempo}
                          </ThemedText>

                          <Ionicons
                            name={
                              item.tipo === "qr"
                                ? "qr-code-outline"
                                : "chevron-forward"
                            }
                            size={28}
                            color="#070b3f"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPedidoDetalle}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPedidoDetalle(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-4">
          <View className="w-full max-w-[560px] bg-white rounded-3xl p-6">
            <View className="flex-row items-center justify-between mb-5">
              <ThemedText className="text-2xl font-black text-[#070b3f]">
                Pedido #{selectedPedido?.idPedido}
              </ThemedText>

              <TouchableOpacity
                onPress={() => setShowPedidoDetalle(false)}
                className="w-12 h-12 rounded-full bg-secondary items-center justify-center"
              >
                <Ionicons name="close" size={26} color="#070b3f" />
              </TouchableOpacity>
            </View>

            <View className="rounded-2xl border border-border p-4 mb-3">
              <ThemedText className="text-sm text-muted-foreground">
                Cliente
              </ThemedText>
              <ThemedText className="mt-1 text-lg font-bold text-[#070b3f]">
                {obtenerNombreCliente(selectedPedido?.usuario)}
              </ThemedText>
            </View>

            <View className="rounded-2xl border border-border p-4 mb-3">
              <ThemedText className="text-sm text-muted-foreground">
                Total
              </ThemedText>
              <ThemedText className="mt-1 text-lg font-black text-primary">
                Bs. {obtenerTotalPedido(selectedPedido).toFixed(2)}
              </ThemedText>
            </View>

            <View className="rounded-2xl border border-border p-4 mb-3">
              <ThemedText className="text-sm text-muted-foreground">
                Tipo de pago
              </ThemedText>
              <ThemedText className="mt-1 text-lg font-bold text-[#070b3f]">
                {mostrarTipoPago(selectedPedido?.tipoPago)}
              </ThemedText>
            </View>

            <View className="rounded-2xl border border-border p-4 mb-3">
              <ThemedText className="text-sm text-muted-foreground">
                Estado
              </ThemedText>
              <ThemedText className="mt-1 text-lg font-bold text-[#070b3f]">
                {selectedPedido?.estado || "No definido"}
              </ThemedText>
            </View>

            <View className="rounded-2xl border border-border p-4 mb-5">
              <ThemedText className="text-sm text-muted-foreground">
                Fecha
              </ThemedText>
              <ThemedText className="mt-1 text-lg font-bold text-[#070b3f]">
                {tiempoTranscurrido(obtenerFechaPedido(selectedPedido))}
              </ThemedText>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowPedidoDetalle(false);
                router.push("/(tabs)/administracion");
              }}
              className="h-14 rounded-2xl bg-primary items-center justify-center"
            >
              <ThemedText className="text-white font-black">
                Ver en administración
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}