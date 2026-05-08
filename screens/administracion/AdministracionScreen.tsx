import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../contexts/AuthContext";

import AdminFilters from "./components/AdminFilters";
import AdminHeader from "./components/AdminHeader";
import AdminMetricCard from "./components/AdminMetricCard";
import AdminSearchBar from "./components/AdminSearchBar";
import AdministradoresModal from "./components/AdministradoresModal";
import ClientesModal from "./components/ClientesModal";
import PedidoCard from "./components/PedidoCard";
import PedidosHoyModal from "./components/PedidosHoyModal";
import VentasCategoriasModal from "./components/VentasCategoriasModal";
import { usePedidos } from "./hooks/usePedidos";

function parseFechaInput(value: string) {
  if (!value) return null;

  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;

  return new Date(Number(year), Number(month) - 1, Number(day));
}

function esMismaFechaODespues(fecha: Date, inicio: Date) {
  const f = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const i = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());

  return f >= i;
}

function esMismaFechaOAntes(fecha: Date, fin: Date) {
  const f = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const e = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());

  return f <= e;
}

export default function AdministracionScreen() {
  const { pedidos, loading, actualizarEstado, refetch } = usePedidos();
  const { isMaster } = useAuth();
const esMaster = isMaster;
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const isCompact = isMobile || isTablet;

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");
  const [categoria, setCategoria] = useState("todas");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [openPedidosHoy, setOpenPedidosHoy] = useState(false);
  const [openVentasCategorias, setOpenVentasCategorias] = useState(false);
  const [openClientes, setOpenClientes] = useState(false);
  const [openAdministradores, setOpenAdministradores] = useState(false);

  const handleRefresh = async () => {
    await refetch();
  };

  const pedidosPorPeriodo = useMemo(() => {
    const inicio = parseFechaInput(fechaInicio);
    const fin = parseFechaInput(fechaFin);

    return pedidos.filter((pedido) => {
      const fechaPedido = new Date(pedido.fechaCreacion);

      const coincideFechaInicio = inicio
        ? esMismaFechaODespues(fechaPedido, inicio)
        : true;

      const coincideFechaFin = fin
        ? esMismaFechaOAntes(fechaPedido, fin)
        : true;

      return coincideFechaInicio && coincideFechaFin;
    });
  }, [pedidos, fechaInicio, fechaFin]);

  const totalPeriodo = pedidosPorPeriodo.reduce(
    (acc, pedido) => acc + Number(pedido.total || 0),
    0
  );

  const pedidosFiltrados = useMemo(() => {
    const inicio = parseFechaInput(fechaInicio);
    const fin = parseFechaInput(fechaFin);

    return pedidos.filter((pedido) => {
      const searchLower = search.trim().toLowerCase();

      const clienteNombre =
        pedido.usuario?.nombre ||
        pedido.usuario?.nombres ||
        pedido.usuario?.correo ||
        "";

      const coincideBusqueda =
        searchLower === "" ||
        String(pedido.idPedido).includes(searchLower) ||
        clienteNombre.toLowerCase().includes(searchLower);

      const coincideEstado =
        estado === "todos" ? true : pedido.estado === estado;

      const coincideCategoria =
        categoria === "todas"
          ? true
          : pedido.detalles?.some((detalle) =>
              detalle.producto?.categoria?.nombre
                ?.toLowerCase()
                .includes(categoria.toLowerCase())
            );

      const fechaPedido = new Date(pedido.fechaCreacion);

      const coincideFechaInicio = inicio
        ? esMismaFechaODespues(fechaPedido, inicio)
        : true;

      const coincideFechaFin = fin
        ? esMismaFechaOAntes(fechaPedido, fin)
        : true;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideCategoria &&
        coincideFechaInicio &&
        coincideFechaFin
      );
    });
  }, [pedidos, search, estado, categoria, fechaInicio, fechaFin]);

  const hoy = new Date();

  const pedidosHoyLista = pedidos.filter((pedido) => {
    const fecha = new Date(pedido.fechaCreacion);

    return (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  });

  const pedidosHoy = pedidosHoyLista.length;

  const cuentasActivas = new Set(
    pedidos
      .filter((pedido) => pedido.usuario?.idRol !== 1)
      .map((pedido) => pedido.usuario?.idUsuario)
      .filter(Boolean)
  ).size;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fbf7f6]">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#fbf7f6]">
      <ScrollView className="flex-1 bg-[#fbf7f6]">
        <View className={isCompact ? "px-4 py-8" : "px-8 py-10"}>
          <View
            className={
              isCompact
                ? "mb-8 gap-5"
                : "flex-row justify-between items-start mb-10 gap-6"
            }
          >
            <AdminHeader isMobile={isCompact} />

            <View className={isCompact ? "w-full gap-3" : "w-[520px] gap-3"}>
              <AdminSearchBar
                search={search}
                setSearch={setSearch}
                fechaInicio={fechaInicio}
                setFechaInicio={setFechaInicio}
                fechaFin={fechaFin}
                setFechaFin={setFechaFin}
                isMobile={isCompact}
              />

              {esMaster && (
                <Pressable
                  onPress={() => setOpenAdministradores(true)}
                  className="bg-[#8b2cff] rounded-2xl px-5 py-4 flex-row items-center justify-center gap-2 shadow-sm"
                >
                  <Ionicons name="person-add-outline" size={21} color="white" />
                  <ThemedText className="text-white font-bold">
                    Dar acceso a administrador
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </View>

          <View className={isCompact ? "gap-4 mb-10" : "flex-row gap-6 mb-12"}>
            <Pressable
              onPress={() => setOpenVentasCategorias(true)}
              className={isCompact ? "w-full" : "flex-1"}
            >
              <AdminMetricCard
                title="Ventas Totales por periodo de Tiempo"
                value={`Bs. ${totalPeriodo.toFixed(2)}`}
                subtitle={`${pedidosPorPeriodo.length} pedidos en el periodo`}
                icon="card-outline"
                isMobile={isCompact}
              />
            </Pressable>

            <Pressable
              onPress={() => setOpenPedidosHoy(true)}
              className={isCompact ? "w-full" : "flex-1"}
            >
              <AdminMetricCard
                title="Pedidos de Hoy"
                value={String(pedidosHoy)}
                subtitle="Pedidos registrados hoy"
                icon="bag-handle-outline"
                isMobile={isCompact}
              />
            </Pressable>

            <Pressable
              onPress={() => setOpenClientes(true)}
              className={isCompact ? "w-full" : "flex-1"}
            >
              <AdminMetricCard
                title="Cuentas Activas"
                value={String(cuentasActivas)}
                subtitle="Clientes con pedidos"
                icon="people-outline"
                isMobile={isCompact}
              />
            </Pressable>
          </View>

          <View
            className={
              isCompact
                ? "gap-4 mb-5"
                : "flex-row justify-between items-center mb-5"
            }
          >
            <ThemedText className="text-2xl font-bold text-[#050816]">
              Pedidos Recientes
            </ThemedText>

            <AdminFilters
              estado={estado}
              setEstado={setEstado}
              categoria={categoria}
              setCategoria={setCategoria}
              isMobile={isCompact}
            />
          </View>

          <View className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            {pedidosFiltrados.length === 0 ? (
              <View className="p-6">
                <ThemedText className="text-center text-gray-500">
                  No se encontraron resultados.
                </ThemedText>
              </View>
            ) : (
              pedidosFiltrados.map((pedido) => (
                <PedidoCard
                  key={pedido.idPedido}
                  pedido={pedido}
                  isMobile={isCompact}
                  onEstadoChange={actualizarEstado}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <PedidosHoyModal
        visible={openPedidosHoy}
        pedidos={pedidosHoyLista}
        isMobile={isCompact}
        onClose={() => setOpenPedidosHoy(false)}
        onEstadoChange={actualizarEstado}
      />

      <VentasCategoriasModal
        visible={openVentasCategorias}
        pedidos={pedidosPorPeriodo}
        onClose={() => setOpenVentasCategorias(false)}
      />

      <ClientesModal
        visible={openClientes}
        pedidos={pedidos}
        onClose={() => setOpenClientes(false)}
        onEstadoChange={actualizarEstado}
      />

      <AdministradoresModal
        visible={openAdministradores}
        onClose={() => setOpenAdministradores(false)}
      />

      <View className="absolute right-4 bottom-8 items-center gap-2">
        <Pressable
          onPress={handleRefresh}
          className="bg-slate-950 w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="refresh-outline" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
}