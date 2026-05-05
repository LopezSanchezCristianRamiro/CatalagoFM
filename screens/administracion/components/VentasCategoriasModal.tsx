import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Pedido } from "../types/pedido.types";

type ProductoVendido = {
  idProducto: number | string;
  nombre: string;
  cantidad: number;
  total: number;
};

type CategoriaVenta = {
  nombre: string;
  cantidad: number;
  total: number;
  productos: ProductoVendido[];
};

export default function VentasCategoriasModal({
  visible,
  pedidos,
  onClose,
}: {
  visible: boolean;
  pedidos: Pedido[];
  onClose: () => void;
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaVenta | null>(null);

  const categorias = useMemo(() => {
    const mapa = new Map<string, CategoriaVenta>();

    pedidos.forEach((pedido) => {
      pedido.detalles?.forEach((detalle) => {
        const producto = detalle.producto;
        const categoriaNombre =
          producto?.categoria?.nombre || "Sin categoría";

        const cantidad = Number(detalle.cantidad || 0);
        const precio = Number(detalle.precioUnitario || 0);
        const total = cantidad * precio;

        if (!mapa.has(categoriaNombre)) {
          mapa.set(categoriaNombre, {
            nombre: categoriaNombre,
            cantidad: 0,
            total: 0,
            productos: [],
          });
        }

        const categoria = mapa.get(categoriaNombre)!;

        categoria.cantidad += cantidad;
        categoria.total += total;

        const idProducto =
  producto?.idProducto ?? producto?.nombre ?? "sin-id";

        const productoExistente = categoria.productos.find(
          (item) => item.idProducto === idProducto
        );

        if (productoExistente) {
          productoExistente.cantidad += cantidad;
          productoExistente.total += total;
        } else {
          categoria.productos.push({
            idProducto,
            nombre: producto?.nombre || "Producto sin nombre",
            cantidad,
            total,
          });
        }
      });
    });

    return Array.from(mapa.values())
      .map((categoria) => ({
        ...categoria,
        productos: categoria.productos.sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => b.total - a.total);
  }, [pedidos]);

  const totalGeneral = categorias.reduce(
    (acc, categoria) => acc + categoria.total,
    0
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 justify-center px-4">
        <View className="bg-white rounded-3xl max-h-[85%] overflow-hidden">
          <View className="p-5 border-b border-gray-200 flex-row justify-between items-center">
            <View className="flex-1 pr-3">
              <ThemedText className="text-xl font-bold text-[#141442]">
                {categoriaSeleccionada
                  ? categoriaSeleccionada.nombre
                  : "Ventas por Categoría"}
              </ThemedText>

              <ThemedText className="text-gray-500 mt-1">
                {categoriaSeleccionada
                  ? "Productos vendidos de esta categoría"
                  : `Total vendido: Bs. ${totalGeneral.toFixed(2)}`}
              </ThemedText>
            </View>

            {categoriaSeleccionada ? (
              <Pressable
                onPress={() => setCategoriaSeleccionada(null)}
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

          <ScrollView className="p-5">
            {!categoriaSeleccionada ? (
              categorias.length > 0 ? (
                categorias.map((categoria) => (
                  <Pressable
                    key={categoria.nombre}
                    onPress={() => setCategoriaSeleccionada(categoria)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 mb-4"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 pr-3">
                        <ThemedText className="text-lg font-bold text-[#141442]">
                          {categoria.nombre}
                        </ThemedText>

                        <ThemedText className="text-gray-500 mt-1">
                          {categoria.cantidad} productos vendidos
                        </ThemedText>
                      </View>

                      <View className="items-end">
                        <ThemedText className="text-purple-600 font-bold text-lg">
                          Bs. {categoria.total.toFixed(2)}
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
                  <Ionicons name="stats-chart-outline" size={42} color="#9ca3af" />
                  <ThemedText className="text-[#141442] font-bold mt-3">
                    No hay ventas
                  </ThemedText>
                  <ThemedText className="text-gray-500 text-center mt-1">
                    No existen ventas en el periodo seleccionado.
                  </ThemedText>
                </View>
              )
            ) : (
              categoriaSeleccionada.productos.map((producto) => (
                <View
                  key={String(producto.idProducto)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 pr-3">
                      <ThemedText className="text-lg font-bold text-[#141442]">
                        {producto.nombre}
                      </ThemedText>

                      <ThemedText className="text-gray-500 mt-1">
                        Cantidad vendida: {producto.cantidad}
                      </ThemedText>
                    </View>

                    <ThemedText className="text-purple-600 font-bold text-lg">
                      Bs. {producto.total.toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}