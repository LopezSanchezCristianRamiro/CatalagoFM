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
const PRIMARY = "#7C3AED";
const DARK = "#070B3F";

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
  const { isAdmin, isMaster, user } = useAuth();

const puedeVerNotificacionesAdmin = isAdmin || isMaster;
  const { width, height } = useWindowDimensions();

  const isMobile = width < 768;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPedidoDetalle, setShowPedidoDetalle] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  const modalHeight = Math.min(height * 0.88, isMobile ? 690 : 760);
  const detailHeight = Math.min(height * 0.9, isMobile ? 680 : 720);

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

  const marcarTodasLeidas = () => {
    const ids = notifications.map((item) => item.id);
    guardarLeidas(ids);
  };

  const cargarAdmin = async (mostrarCarga = false) => {
    if (!user || !puedeVerNotificacionesAdmin) return;

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
  }, [puedeVerNotificacionesAdmin, user]);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !readIds.includes(item.id)).length;
  }, [notifications, readIds]);

  if (!user || !puedeVerNotificacionesAdmin) return null;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setShowNotifications(true);
          cargarAdmin(false);
        }}
        className={
          isMobile
            ? "absolute right-4 top-4 z-[999] w-12 h-12 rounded-full bg-white items-center justify-center border border-slate-200"
            : "absolute right-[190px] top-[10px] z-[999] w-11 h-11 items-center justify-center rounded-full hover:bg-primary/10"
        }
        style={
          isMobile
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.22,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 5 },
                elevation: 8,
              }
            : undefined
        }
      >
        <Ionicons
          name="notifications-outline"
          size={isMobile ? 25 : 24}
          color={isMobile ? PRIMARY : "#050816"}
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
              {unreadCount > 99 ? "99+" : unreadCount}
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
        <View className="flex-1 bg-black/50 justify-center items-center px-3">
          <View
            className={
              isMobile
                ? "w-full max-w-[390px] bg-white rounded-[32px] overflow-hidden"
                : "w-full max-w-[760px] bg-white rounded-[34px] overflow-hidden"
            }
            style={{
              height: modalHeight,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 12,
            }}
          >
            <View className="px-5 pt-5 pb-4 bg-white border-b border-slate-100">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-2">
                    <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center">
                      <Ionicons
                        name="notifications"
                        size={23}
                        color={PRIMARY}
                      />
                    </View>

                    <View className="flex-1">
                      <ThemedText
                        className={
                          isMobile
                            ? "text-xl font-black text-[#070B3F]"
                            : "text-2xl font-black text-[#070B3F]"
                        }
                      >
                        Notificaciones
                      </ThemedText>

                      <ThemedText className="text-xs text-slate-500 mt-0.5">
                        {unreadCount > 0
                          ? `${unreadCount} sin leer`
                          : "Todo al día"}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowNotifications(false)}
                  className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center"
                >
                  <Ionicons name="close" size={27} color={DARK} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-between mt-5">
                <View className="px-4 py-2 rounded-full bg-primary/10">
                  <ThemedText className="text-primary text-xs font-black">
                    Pedidos y pagos QR
                  </ThemedText>
                </View>

                {notifications.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={marcarTodasLeidas}
                    className="px-4 py-2 rounded-full bg-slate-100"
                  >
                    <ThemedText className="text-slate-600 text-xs font-black">
                      Marcar leídas
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {loading ? (
              <View className="flex-1 items-center justify-center px-6">
                <ActivityIndicator color={PRIMARY} size="large" />
                <ThemedText className="mt-4 text-slate-500 text-center">
                  Cargando notificaciones...
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                className="flex-1 bg-slate-50"
                showsVerticalScrollIndicator
                contentContainerStyle={{
                  paddingHorizontal: isMobile ? 14 : 22,
                  paddingTop: 18,
                  paddingBottom: 26,
                }}
              >
                {notifications.length === 0 ? (
                  <View className="items-center justify-center py-20 px-6">
                    <View className="w-20 h-20 rounded-full bg-slate-100 items-center justify-center">
                      <Ionicons
                        name="notifications-off-outline"
                        size={42}
                        color="#94A3B8"
                      />
                    </View>

                    <ThemedText className="mt-4 text-lg font-black text-[#070B3F] text-center">
                      Sin notificaciones
                    </ThemedText>

                    <ThemedText className="mt-2 text-slate-500 text-center">
                      Cuando llegue un nuevo pedido aparecerá aquí.
                    </ThemedText>
                  </View>
                ) : (
                  notifications.map((item) => {
                    const isRead = readIds.includes(item.id);
                    const isQr = item.tipo === "qr";

                    return (
                      <TouchableOpacity
                        activeOpacity={0.88}
                        key={item.id}
                        onPress={() => abrirPedido(item)}
                        className={`mb-4 rounded-[28px] border bg-white overflow-hidden ${
                          isRead
                            ? "border-slate-100 opacity-75"
                            : "border-primary/25"
                        }`}
                        style={{
                          shadowColor: "#000",
                          shadowOpacity: isRead ? 0.04 : 0.09,
                          shadowRadius: 14,
                          shadowOffset: { width: 0, height: 6 },
                          elevation: isRead ? 1 : 4,
                        }}
                      >
                        <View className="p-4">
                          <View className="flex-row items-start">
                            <View
                              className={`w-12 h-12 rounded-2xl items-center justify-center ${
                                isQr ? "bg-emerald-50" : "bg-primary/10"
                              }`}
                            >
                              <Ionicons
                                name={
                                  isQr
                                    ? "qr-code-outline"
                                    : "bag-check-outline"
                                }
                                size={24}
                                color={isQr ? "#059669" : PRIMARY}
                              />
                            </View>

                            <View className="flex-1 ml-3">
                              <View className="flex-row items-start justify-between gap-2">
                                <View className="flex-1">
                                  <View className="flex-row items-center gap-2">
                                    {!isRead && (
                                      <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    )}

                                    <ThemedText
                                      className={`font-black ${
                                        isMobile ? "text-base" : "text-lg"
                                      } ${
                                        isRead
                                          ? "text-slate-500"
                                          : "text-[#070B3F]"
                                      }`}
                                    >
                                      {item.titulo}
                                    </ThemedText>
                                  </View>

                                  <ThemedText
                                    className={`mt-2 leading-5 ${
                                      isRead
                                        ? "text-slate-400"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {item.mensaje}
                                  </ThemedText>
                                </View>

                                <Ionicons
                                  name="chevron-forward"
                                  size={22}
                                  color={isRead ? "#CBD5E1" : DARK}
                                />
                              </View>

                              <View className="flex-row items-center justify-between mt-4">
                                <View
                                  className={`px-3 py-1.5 rounded-full ${
                                    isQr ? "bg-emerald-50" : "bg-primary/10"
                                  }`}
                                >
                                  <ThemedText
                                    className={`text-xs font-black ${
                                      isQr
                                        ? "text-emerald-700"
                                        : "text-primary"
                                    }`}
                                  >
                                    {isQr ? "Pago QR" : "Pedido"}
                                  </ThemedText>
                                </View>

                                <ThemedText
                                  className={`text-xs font-bold ${
                                    isRead ? "text-slate-400" : "text-primary"
                                  }`}
                                >
                                  {item.tiempo}
                                </ThemedText>
                              </View>
                            </View>
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
        <View className="flex-1 bg-black/50 justify-center items-center px-3">
          <View
            className={
              isMobile
                ? "w-full max-w-[390px] bg-white rounded-[32px] overflow-hidden"
                : "w-full max-w-[620px] bg-white rounded-[34px] overflow-hidden"
            }
            style={{
              height: detailHeight,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 12,
            }}
          >
            <View className="px-5 pt-5 pb-4 border-b border-slate-100 bg-white">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <ThemedText
                    className={
                      isMobile
                        ? "text-2xl font-black text-[#070B3F]"
                        : "text-3xl font-black text-[#070B3F]"
                    }
                  >
                    Pedido #{selectedPedido?.idPedido}
                  </ThemedText>

                  <ThemedText className="mt-1 text-slate-500">
                    Detalle completo del pedido
                  </ThemedText>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowPedidoDetalle(false)}
                  className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center"
                >
                  <Ionicons name="close" size={27} color={DARK} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              className="flex-1 bg-slate-50"
              showsVerticalScrollIndicator
              contentContainerStyle={{
                paddingHorizontal: isMobile ? 14 : 22,
                paddingTop: 18,
                paddingBottom: 28,
              }}
            >
              <View className={isMobile ? "gap-3" : "gap-4"}>
                <View className="rounded-[26px] bg-white border border-slate-100 p-5">
                  <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center">
                      <Ionicons name="person-outline" size={22} color={PRIMARY} />
                    </View>

                    <View className="flex-1">
                      <ThemedText className="text-xs text-slate-500">
                        Cliente
                      </ThemedText>
                      <ThemedText className="mt-1 text-lg font-black text-[#070B3F]">
                        {obtenerNombreCliente(selectedPedido?.usuario)}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 rounded-[26px] bg-white border border-slate-100 p-5">
                    <ThemedText className="text-xs text-slate-500">
                      Estado
                    </ThemedText>
                    <ThemedText className="mt-2 text-base font-black text-[#070B3F]">
                      {formatearEstado(selectedPedido?.estado)}
                    </ThemedText>
                  </View>

                  <View className="flex-1 rounded-[26px] bg-white border border-slate-100 p-5">
                    <ThemedText className="text-xs text-slate-500">
                      Pago
                    </ThemedText>
                    <ThemedText className="mt-2 text-base font-black text-[#070B3F]">
                      {formatearPago(selectedPedido?.tipoPago)}
                    </ThemedText>
                  </View>
                </View>

                <View className="rounded-[26px] bg-white border border-primary/20 p-5">
                  <ThemedText className="text-xs text-slate-500">
                    Total
                  </ThemedText>
                  <ThemedText className="mt-2 text-3xl font-black text-primary">
                    Bs. {obtenerTotalPedido(selectedPedido).toFixed(2)}
                  </ThemedText>
                </View>

                <View className="rounded-[26px] bg-white border border-slate-100 p-5">
                  <ThemedText className="text-xs text-slate-500">
                    Fecha
                  </ThemedText>
                  <ThemedText className="mt-2 text-base font-black text-[#070B3F]">
                    {tiempoTranscurrido(obtenerFechaPedido(selectedPedido))}
                  </ThemedText>
                </View>

                <View className="rounded-[26px] bg-white border border-slate-100 p-5">
                  <View className="flex-row items-center justify-between mb-4">
                    <ThemedText className="text-base font-black text-[#070B3F]">
                      Productos
                    </ThemedText>

                    <View className="px-3 py-1.5 rounded-full bg-slate-100">
                      <ThemedText className="text-xs font-black text-slate-600">
                        {selectedPedido?.detalles?.length || 0} item(s)
                      </ThemedText>
                    </View>
                  </View>

                  {!selectedPedido?.detalles ||
                  selectedPedido.detalles.length === 0 ? (
                    <View className="items-center py-8">
                      <Ionicons
                        name="cube-outline"
                        size={38}
                        color="#94A3B8"
                      />
                      <ThemedText className="mt-2 text-slate-500 text-center">
                        Este pedido no tiene productos cargados.
                      </ThemedText>
                    </View>
                  ) : (
                    selectedPedido.detalles.map((detalle, index) => {
                      const cantidad = detalle.cantidad || 1;
                      const subtotal = Number(
                        detalle.subtotal ||
                          (detalle.precioUnitario || 0) * cantidad,
                      );

                      return (
                        <View
                          key={index}
                          className="py-4 border-b border-slate-100 last:border-b-0"
                        >
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1">
                              <ThemedText className="font-black text-[#070B3F]">
                                {detalle.producto?.nombre ||
                                  detalle.producto?.titulo ||
                                  "Producto"}
                              </ThemedText>

                              <ThemedText className="mt-1 text-sm text-slate-500">
                                Cantidad: {cantidad}
                              </ThemedText>
                            </View>

                            <ThemedText className="font-black text-primary">
                              Bs. {subtotal.toFixed(2)}
                            </ThemedText>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowPedidoDetalle(false)}
                  className="h-14 rounded-2xl bg-primary items-center justify-center mt-2"
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