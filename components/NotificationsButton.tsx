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

type NotificationItem = {
  id: string;
  tipo: "pedido" | "qr" | "estado";
  titulo: string;
  mensaje: string;
  tiempo: string;
  fecha: string;
};

const STORAGE_READ_KEY = "notifications_read";
const STORAGE_ESTADOS_KEY = "cliente_pedidos_estados";

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

function obtenerFechaPedido(pedido: Pedido) {
  return pedido.fechaCreacion || pedido.created_at || "";
}

function obtenerTotalPedido(pedido: Pedido) {
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
  const { isAdmin } = useAuth();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  const cargarAdmin = async () => {
    const response = await httpClient.getAuth<PedidosResponse>(
      "/api/admin/pedidos",
    );

    const pedidosData = response.pedidos || [];

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
            tipo: "pedido",
            titulo: `Nuevo pedido #${pedido.idPedido}`,
            mensaje: `${cliente} hizo una compra por Bs. ${total.toFixed(2)}.`,
            tiempo: tiempoTranscurrido(fecha),
            fecha,
          },
        ];

        if (
          String(pedido.tipoPago || "")
            .toLowerCase()
            .includes("qr")
        ) {
          lista.push({
            id: `qr-${pedido.idPedido}`,
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
  };

  const cargarCliente = async () => {
    const response = await httpClient.getAuth<PedidosResponse>(
      "/api/mis-pedidos",
    );

    const pedidosData = response.pedidos || [];
    const estadosGuardados = getStoredJson<Record<string, string>>(
      STORAGE_ESTADOS_KEY,
      {},
    );

    const nuevosEstados: Record<string, string> = {};
    const nuevasNotificaciones: NotificationItem[] = [];

    pedidosData.forEach((pedido) => {
      const id = String(pedido.idPedido);
      const estadoActual = pedido.estado || "No definido";
      const estadoAnterior = estadosGuardados[id];

      nuevosEstados[id] = estadoActual;

      if (estadoAnterior && estadoAnterior !== estadoActual) {
        nuevasNotificaciones.push({
          id: `estado-${pedido.idPedido}-${estadoActual}`,
          tipo: "estado",
          titulo: `Pedido #${pedido.idPedido}`,
          mensaje: `Tu pedido cambió de "${formatearEstado(
            estadoAnterior,
          )}" a "${formatearEstado(estadoActual)}".`,
          tiempo: tiempoTranscurrido(obtenerFechaPedido(pedido)),
          fecha: obtenerFechaPedido(pedido),
        });
      }
    });

    setStoredJson(STORAGE_ESTADOS_KEY, nuevosEstados);

    setNotifications((prev) => {
      const ids = new Set(prev.map((n) => n.id));
      const filtradas = nuevasNotificaciones.filter((n) => !ids.has(n.id));

      return [...filtradas, ...prev];
    });
  };

  const cargarNotificaciones = async (mostrarCarga = false) => {
    try {
      if (mostrarCarga) setLoading(true);

      if (isAdmin) {
        await cargarAdmin();
      } else {
        await cargarCliente();
      }
    } catch (error) {
      console.error("Error notificaciones", error);
    } finally {
      if (mostrarCarga) setLoading(false);
    }
  };

  useEffect(() => {
    cargarLeidas();
    cargarNotificaciones(true);

    const interval = setInterval(() => {
      cargarNotificaciones(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !readIds.includes(item.id)).length;
  }, [notifications, readIds]);

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setShowNotifications(true);
          cargarNotificaciones(false);
        }}
        className={
          isMobile
            ? "absolute right-4 top-4 z-[999] w-12 h-12 rounded-full bg-white items-center justify-center border border-border"
            : "absolute right-[245px] top-[26px] z-[999] w-11 h-11 items-center justify-center rounded-full hover:bg-primary/10"
        }
        style={
          isMobile
            ? {
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
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
                : "absolute -top-2 -right-2 bg-primary rounded-full min-w-[20px] h-[20px] items-center justify-center px-1 border-2 border-white"
            }
          >
            <Text
              className={
                isMobile
                  ? "text-white text-[10px] font-black"
                  : "text-white text-[9px] font-black"
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
        <View className="flex-1 bg-black/40 justify-start items-center pt-4 px-3">
          <View
            className={
              isMobile
                ? "w-full max-h-[86%] bg-white rounded-3xl overflow-hidden"
                : "w-full max-w-[1200px] max-h-[86%] bg-white rounded-3xl overflow-hidden"
            }
          >
            <View className="px-7 py-6 border-b border-border flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <ThemedText className="text-2xl font-black text-[#070b3f]">
                  Notificaciones
                </ThemedText>

                <ThemedText className="mt-2 text-base text-muted-foreground">
                  {isAdmin
                    ? "Pedidos recientes y pagos QR"
                    : "Actualizaciones de tus pedidos"}
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
                className="px-7 py-7"
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
                        onPress={() => marcarLeida(item.id)}
                        className={`mb-5 rounded-2xl border px-6 py-5 ${
                          isRead
                            ? "border-border bg-white"
                            : "border-primary/30 bg-primary/5"
                        }`}
                      >
                        <View
                          className={
                            isMobile
                              ? "gap-3"
                              : "flex-row items-center justify-between"
                          }
                        >
                          <View className="flex-1 pr-4">
                            <View className="flex-row items-center gap-2">
                              {!isRead && (
                                <View className="w-3 h-3 rounded-full bg-primary" />
                              )}

                              <ThemedText className="text-xl font-black text-[#070b3f]">
                                {item.titulo}
                              </ThemedText>
                            </View>

                            <ThemedText className="mt-3 text-base text-muted-foreground">
                              {item.mensaje}
                            </ThemedText>
                          </View>

                          <View className="flex-row items-center justify-end">
                            <ThemedText className="mr-4 text-lg font-black text-primary">
                              {item.tiempo}
                            </ThemedText>

                            <Ionicons
                              name={
                                item.tipo === "qr"
                                  ? "qr-code-outline"
                                  : "chevron-forward"
                              }
                              size={26}
                              color="#070b3f"
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
    </>
  );
}