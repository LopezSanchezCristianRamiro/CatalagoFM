import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";

import AdminFilters from "./components/AdminFilters";
import AdminHeader from "./components/AdminHeader";
import AdminMetricCard from "./components/AdminMetricCard";
import AdminSearchBar from "./components/AdminSearchBar";
import PedidoCard from "./components/PedidoCard";
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
  const { pedidos, loading, actualizarEstado } = usePedidos();
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1024;

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("todos");
  const [categoria, setCategoria] = useState("todas");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

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

  const pedidosDelMes = pedidos.filter((pedido) => {
    const fecha = new Date(pedido.fechaCreacion);

    return (
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  });

  const totalMes = pedidosDelMes.reduce(
    (acc, pedido) => acc + Number(pedido.total || 0),
    0
  );

  const pedidosHoy = pedidos.filter((pedido) => {
    const fecha = new Date(pedido.fechaCreacion);

    return (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  }).length;

  const cuentasActivas = new Set(
    pedidos.map((pedido) => pedido.usuario?.idUsuario).filter(Boolean)
  ).size;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fbf7f6]">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#fbf7f6]">
      <View className={isMobile ? "px-4 py-8" : "px-8 py-10"}>
        <View
          className={
            isMobile
              ? "mb-8 gap-5"
              : "flex-row justify-between items-start mb-10 gap-6"
          }
        >
          <AdminHeader isMobile={isMobile} />

          <View
            className={
              isMobile ? "w-full" : isTablet ? "w-[430px]" : "w-[520px]"
            }
          >
            <AdminSearchBar
              search={search}
              setSearch={setSearch}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
              isMobile={isMobile}
            />
          </View>
        </View>

        <View className={isMobile ? "gap-4 mb-10" : "flex-row gap-6 mb-12"}>
          <AdminMetricCard
            title="Ventas Totales (Mes)"
            value={`Bs. ${totalMes.toFixed(2)}`}
            subtitle={`${pedidosDelMes.length} pedidos este mes`}
            icon="card-outline"
            isMobile={isMobile}
          />

          <AdminMetricCard
            title="Pedidos de Hoy"
            value={String(pedidosHoy)}
            subtitle="Pedidos registrados hoy"
            icon="bag-handle-outline"
            isMobile={isMobile}
          />

          <AdminMetricCard
            title="Cuentas Activas"
            value={String(cuentasActivas)}
            subtitle="Clientes con pedidos"
            icon="people-outline"
            isMobile={isMobile}
          />
        </View>

        <View
          className={
            isMobile
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
            isMobile={isMobile}
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
        isMobile={isMobile}
        onEstadoChange={actualizarEstado}
      />
    ))
  )}
</View>
      </View>
    </ScrollView>
  );
}