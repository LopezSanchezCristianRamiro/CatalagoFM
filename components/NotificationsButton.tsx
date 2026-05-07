// components/NotificationsButton.tsx

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { httpClient } from "../http/httpClient";
import { ThemedText } from "./ThemedText";

type UsuarioPedido = {
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  correo?: string;
  email?: string;
};

type ProductoPedido = {
  nombre?: string;
  titulo?: string;
  precio?: number;
};

type DetallePedido = {
  cantidad?: number;
  precioUnitario?: number;
  subtotal?: number;
  producto?: ProductoPedido;
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
  detalles?: DetallePedido[];
};

type PedidosResponse = {
  pedidos: Pedido[];
};

type NotificationItem = {
  id: string;
  idPedido: number;
  tipo: "pedido" | "qr";
  titulo: string;
  mensaje: string;
  tiempo: string;
  fecha: string;
};

const STORAGE_READ_KEY = "admin_notifications_read";

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

function formatearEstado(estado?: string) {
  if (!estado) return "No definido";

  const estadoLower = estado.toLowerCase();

  if (estadoLower === "pendiente") return "Pendiente";
  if (estadoLower === "pagado") return "Pagado";
  if (estadoLower === "entregado") return "Entregado";
  if (estadoLower === "cancelado") return "Cancelado";

  return estado;
}

function formatearPago(tipoPago?: string) {
  const tipo = String(tipoPago || "").toLowerCase();

  if (tipo.includes("qr")) return "Pago QR";
  if (tipo.includes("contra")) return "Contra entrega";
  if (tipo.includes("tarjeta")) return "Tarjeta";

  return tipoPago || "No definido";
}

function getStoredJson<T>(key: string, fallback: T): T {
  if (Platform.OS !== "web") return fallback;

  try {
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredJson<T>(key: string, value: T) {
  if (Platform.OS !== "web") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function NotificationsButton() {
  const { isAdmin, user } = useAuth();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPedidoDetalle, setShowPedidoDetalle] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  const activeColor = "#7C3AED";

  const cargarLeidas = () => {
    setReadIds(getStoredJson<string[]>(STORAGE_READ_KEY, []));
  };

  const guardarLeidas = (ids: string[]) => {
    setReadIds(ids);
    setStoredJson(STORAGE_READ_KEY, ids);
  };

  const marcarLeida = (id: string) => {
    if (readIds.includes(id)) return;
    guardarLeidas([...readIds, id]);
  };

  const cargarAdmin = async (mostrarCarga = false) => {
    if (!user || !isAdmin) return;

    try {
      if (mostrarCarga) setLoading(true);

      const response = await httpClient.getAuth<PedidosResponse>(
        "/api/admin/pedidos",
      );

      const pedidosData = response.pedidos || [];
      setPedidos(pedidosData);

      const notificaciones = pedidosData
        .slice()
        .sort((a, b) => {
          const fechaA = new Date(obtenerFechaPedido(a)).getTime();
          const fechaB = new Date(obtenerFechaPedido(b)).getTime();
          return fechaB - fechaA;
        })
        .flatMap((pedido) => {
          const fecha = obtenerFechaPedido(pedido);
          const cliente = obtenerNombreCliente(pedido.usuario);
          const total = obtenerTotalPedido(pedido);

          const lista: NotificationItem[] = [
            {
              id: `pedido-${pedido.idPedido}`,
              idPedido: pedido.idPedido,
              tipo: "pedido",
              titulo: `Nuevo pedido #${pedido.idPedido}`,
              mensaje: `${cliente} hizo una compra por Bs. ${total.toFixed(
                2,
              )}.`,
              tiempo: tiempoTranscurrido(fecha),
              fecha,
            },
          ];

          if (String(pedido.tipoPago || "").toLowerCase().includes("qr")) {
            lista.push({
              id: `qr-${pedido.idPedido}`,
              idPedido: pedido.idPedido,
              tipo: "qr",
              titulo: `Pago QR #${pedido.idPedido}`,
              mensaje: `${cliente} realizó un pago QR por Bs. ${total.toFixed(
                2,
              )}.`,
              tiempo: tiempoTranscurrido(fecha),
              fecha,
            });
          }

          return lista;
        });

      setNotifications(notificaciones);
    } catch (error) {
      console.error("Error notificaciones admin", error);
    } finally {
      if (mostrarCarga) setLoading(false);
    }
  };

  const abrirPedido = (item: NotificationItem) => {
    marcarLeida(item.id);

    const pedido = pedidos.find((p) => p.idPedido === item.idPedido);
    if (!pedido) return;

    setSelectedPedido(pedido);
    setShowNotifications(false);
    setShowPedidoDetalle(true);
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    cargarLeidas();
    cargarAdmin(true);

    const interval = setInterval(() => {
      cargarAdmin(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAdmin, user]);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !readIds.includes(item.id)).length;
  }, [notifications, readIds]);

  if (!user || !isAdmin) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setShowNotifications(true);
          cargarAdmin(false);
        }}
        className={
          isMobile
            ? "absolute right-4 top-4 z-[999] w-12 h-12 rounded-full bg-white items-center justify-center border border-border"
            : "absolute right-[190px] top-[10px] z-[999] w-11 h-11 items-center justify-center rounded-full hover:bg-primary/10"
        }
        style={
          isMobile
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }
            : undefined
        }
      >
        <Ionicons
          name="notifications-outline"
          size={isMobile ? 25 : 24}
          color={isMobile ? activeColor : "#050816"}
        />

        {unreadCount > 0 && (
          <View
            className={
              isMobile
                ? "absolute -top-2 -right-2 bg-primary rounded-full min-w-[24px] h-[24px] items-center justify-center px-1 border-2 border-white"
                : "absolute -top-0 right-[5px] bg-primary rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border-2 border-white"
            }
          >
            <Text
              className={
                isMobile
                  ? "text-white text-[10px] font-black"
                  : "text-white text-[8px] font-black"
              }
            >
              {unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-3">
          <View
            className={
              isMobile
                ? "w-full max-w-[360px] max-h-[88%] bg-white rounded-3xl overflow-hidden"
                : "w-full max-w-[900px] max-h-[86%] bg-white rounded-3xl overflow-hidden"
            }
          >
            <View className="px-7 py-6 border-b border-border flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <ThemedText className="text-2xl font-black text-[#070b3f]">
                  Notificaciones
                </ThemedText>

                <ThemedText className="mt-2 text-base text-muted-foreground">
                  Pedidos recientes y pagos QR
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                className="w-14 h-14 rounded-full bg-secondary items-center justify-center"
              >
                <Ionicons name="close" size={30} color="#070b3f" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator color={activeColor} />
                <ThemedText className="mt-3 text-muted-foreground">
                  Cargando notificaciones...
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                className="px-6 py-6"
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                {notifications.length === 0 ? (
                  <View className="items-center py-16">
                    <Ionicons
                      name="notifications-off-outline"
                      size={48}
                      color="#9CA3AF"
                    />
                    <ThemedText className="mt-3 text-muted-foreground text-center">
                      No tienes notificaciones.
                    </ThemedText>
                  </View>
                ) : (
                  notifications.map((item) => {
                    const isRead = readIds.includes(item.id);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => abrirPedido(item)}
                        className={`mb-4 rounded-2xl border px-5 py-5 ${
                          isRead
                            ? "border-border bg-white opacity-70"
                            : "border-primary/40 bg-primary/5"
                        }`}
                      >
                        <View
                          className={
                            isMobile
                              ? "gap-3"
                              : "flex-row items-center justify-between"
                          }
                        >
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2">
                              {!isRead && (
                                <View className="w-3 h-3 rounded-full bg-primary" />
                              )}

                              <ThemedText
                                className={`text-xl font-black ${
                                  isRead
                                    ? "text-slate-500"
                                    : "text-[#070b3f]"
                                }`}
                              >
                                {item.titulo}
                              </ThemedText>
                            </View>

                            <ThemedText
                              className={`mt-3 text-base ${
                                isRead
                                  ? "text-slate-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {item.mensaje}
                            </ThemedText>
                          </View>

                          <View className="flex-row items-center justify-end">
                            <ThemedText
                              className={`mr-4 text-lg font-black ${
                                isRead ? "text-slate-400" : "text-primary"
                              }`}
                            >
                              {item.tiempo}
                            </ThemedText>

                            <Ionicons
                              name={
                                item.tipo === "qr"
                                  ? "qr-code-outline"
                                  : "chevron-forward"
                              }
                              size={26}
                              color={isRead ? "#94A3B8" : "#070b3f"}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
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
          <View
            className={
              isMobile
                ? "w-full max-w-[360px] max-h-[88%] bg-white rounded-3xl p-5"
                : "w-full max-w-[560px] max-h-[88%] bg-white rounded-3xl p-6"
            }
          >
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText
                className={
                  isMobile
                    ? "text-xl font-black text-[#070b3f]"
                    : "text-2xl font-black text-[#070b3f]"
                }
              >
                Pedido #{selectedPedido?.idPedido}
              </ThemedText>

              <TouchableOpacity
                onPress={() => setShowPedidoDetalle(false)}
                className="w-11 h-11 rounded-full bg-secondary items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#070b3f" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: isMobile ? 24 : 4 }}
            >
              <View className={isMobile ? "gap-3" : ""}>
                <View className="rounded-2xl border border-border p-4">
                  <ThemedText className="text-xs text-muted-foreground">
                    Cliente
                  </ThemedText>
                  <ThemedText className="mt-1 text-base font-bold text-[#070b3f]">
                    {obtenerNombreCliente(selectedPedido?.usuario)}
                  </ThemedText>
                </View>

                <View className="rounded-2xl border border-border p-4">
                  <ThemedText className="text-xs text-muted-foreground">
                    Estado
                  </ThemedText>
                  <ThemedText className="mt-1 text-base font-bold text-[#070b3f]">
                    {formatearEstado(selectedPedido?.estado)}
                  </ThemedText>
                </View>

                <View className="rounded-2xl border border-border p-4">
                  <ThemedText className="text-xs text-muted-foreground">
                    Tipo de pago
                  </ThemedText>
                  <ThemedText className="mt-1 text-base font-bold text-[#070b3f]">
                    {formatearPago(selectedPedido?.tipoPago)}
                  </ThemedText>
                </View>

                <View className="rounded-2xl border border-border p-4">
                  <ThemedText className="text-xs text-muted-foreground">
                    Total
                  </ThemedText>
                  <ThemedText className="mt-1 text-xl font-black text-primary">
                    Bs. {obtenerTotalPedido(selectedPedido).toFixed(2)}
                  </ThemedText>
                </View>

                <View className="rounded-2xl border border-border p-4">
                  <ThemedText className="text-xs text-muted-foreground">
                    Fecha
                  </ThemedText>
                  <ThemedText className="mt-1 text-base font-bold text-[#070b3f]">
                    {tiempoTranscurrido(obtenerFechaPedido(selectedPedido))}
                  </ThemedText>
                </View>

                {selectedPedido?.detalles &&
                  selectedPedido.detalles.length > 0 && (
                    <View className="rounded-2xl border border-border p-4">
                      <ThemedText className="text-xs text-muted-foreground mb-3">
                        Productos
                      </ThemedText>

                      {selectedPedido.detalles.map((detalle, index) => (
                        <View
                          key={index}
                          className="border-b border-border py-3 last:border-b-0"
                        >
                          <ThemedText className="font-bold text-[#070b3f]">
                            {detalle.producto?.nombre ||
                              detalle.producto?.titulo ||
                              "Producto"}
                          </ThemedText>

                          <ThemedText className="mt-1 text-sm text-muted-foreground">
                            Cantidad: {detalle.cantidad || 1}
                          </ThemedText>

                          <ThemedText className="mt-1 text-sm text-muted-foreground">
                            Subtotal: Bs.{" "}
                            {Number(
                              detalle.subtotal ||
                                (detalle.precioUnitario || 0) *
                                  (detalle.cantidad || 1),
                            ).toFixed(2)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}

                <TouchableOpacity
                  onPress={() => setShowPedidoDetalle(false)}
                  className="h-14 rounded-2xl bg-primary items-center justify-center mt-4"
                >
                  <ThemedText className="text-white font-black">
                    Cerrar detalle
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}