import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import CategoriaForm from "./components/CategoriaForm";
import ProductoCard from "./components/ProductoCard";
import ProductoImagenesModal from "./components/ProductoImagenesModal";
import ProductoModal from "./components/ProductoModal";
import SearchBar from "./components/SearchBar";
import { useProductos } from "./hooks/useProductos";
import { productoService } from "./services/productoService";
import { Categoria, Producto } from "./types/producto.types";
export default function ProductosScreen() {
  const { productos, categorias, loading, refetch } = useProductos();
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const [categoriaBloqueada, setCategoriaBloqueada] =
    useState<Categoria | null>(null);
  const [productosCategoriaBloqueada, setProductosCategoriaBloqueada] =
    useState<Producto[]>([]);
  const [tab, setTab] = useState<"productos" | "categorias">("productos");
  const [busqueda, setBusqueda] = useState("");

  const [modalProducto, setModalProducto] = useState(false);
  const [productoImagenes, setProductoImagenes] = useState<Producto | null>(
    null,
  );
  const [productoEditando, setProductoEditando] = useState<Producto | null>(
    null,
  );
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null,
  );
  const [categoriaAnimandoBoton, setCategoriaAnimandoBoton] = useState<
    number | null
  >(null);
  const [productoEliminar, setProductoEliminar] = useState<number | null>(null);
  const [productoAnimandoEliminar, setProductoAnimandoEliminar] = useState<
    number | null
  >(null);

  const [categoriaEliminar, setCategoriaEliminar] = useState<number | null>(
    null,
  );
  const [categoriaAnimandoEliminar, setCategoriaAnimandoEliminar] = useState<
    number | null
  >(null);

  const [eliminando, setEliminando] = useState(false);

  const productosFiltrados = productos.filter((p) =>
    `${p.nombre} ${p.descripcion ?? ""} ${p.categoria?.nombre ?? ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const abrirNuevoProducto = () => {
    setProductoEditando(null);
    setModalProducto(true);
    setTab("productos");
  };

  const editarProducto = (producto: Producto) => {
    setProductoEditando(producto);
    setModalProducto(true);
    setTab("productos");
  };

  const cerrarModalProducto = () => {
    setProductoEditando(null);
    setModalProducto(false);
  };

  const abrirNuevaCategoria = () => {
    setCategoriaEditando({
      idCategoria: 0,
      nombre: "",
    } as Categoria);
    setTab("categorias");
  };

  const confirmarEliminarProducto = (id: number) => {
    setProductoEliminar(id);
  };

  const eliminarProducto = async () => {
    if (!productoEliminar) return;

    try {
      setEliminando(true);
      setProductoAnimandoEliminar(productoEliminar);
      setProductoEliminar(null);

      setTimeout(async () => {
        await productoService.deleteProducto(productoEliminar);

        Toast.show({
          type: "success",
          text1: "Producto eliminado",
        });

        await refetch();
        setProductoAnimandoEliminar(null);
        setEliminando(false);
      }, 450);
    } catch {
      Toast.show({
        type: "error",
        text1: "No se pudo eliminar el producto",
      });

      setProductoAnimandoEliminar(null);
      setEliminando(false);
    }
  };

  const confirmarEliminarCategoria = (id: number) => {
    const categoria = categorias.find((cat) => cat.idCategoria === id);

    const productosAsociados = productos.filter(
      (producto) => producto.idCategoria === id,
    );

    if (productosAsociados.length > 0) {
      setCategoriaBloqueada(categoria ?? null);
      setProductosCategoriaBloqueada(productosAsociados);
      return;
    }

    setCategoriaEliminar(id);
  };

  const eliminarCategoria = async () => {
    if (!categoriaEliminar) return;

    try {
      setEliminando(true);
      setCategoriaAnimandoEliminar(categoriaEliminar);
      setCategoriaEliminar(null);

      setTimeout(async () => {
        await productoService.deleteCategoria(categoriaEliminar);

        Toast.show({
          type: "success",
          text1: "Categoría eliminada",
        });

        await refetch();
        setCategoriaAnimandoEliminar(null);
        setEliminando(false);
      }, 450);
    } catch {
      Toast.show({
        type: "error",
        text1: "No se pudo eliminar la categoría",
      });

      setCategoriaAnimandoEliminar(null);
      setEliminando(false);
    }
  };

  return (
    <View className="flex-1 bg-white border-b border-slate-200">
      <View className="pt-12 px-4 pb-3 bg-white border-b border-slate-200 z-20">
        <SearchBar
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar aplicaciones o categorías..."
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
      >
        <View
          className={`w-full self-center py-6 ${
            isMobile ? "" : "max-w-[900px]"
          }`}
        >
          <View className="flex-row border-b border-purple-200 mb-6">
            <Pressable
              onPress={() => setTab("productos")}
              className={`flex-1 pb-3 items-center ${
                tab === "productos" ? "border-b-2 border-purple-600" : ""
              }`}
            >
              <ThemedText
                className={`font-semibold ${
                  tab === "productos" ? "text-purple-700" : "text-slate-400"
                }`}
              >
                Productos
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setTab("categorias")}
              className={`flex-1 pb-3 items-center ${
                tab === "categorias" ? "border-b-2 border-purple-600" : ""
              }`}
            >
              <ThemedText
                className={`font-semibold ${
                  tab === "categorias" ? "text-purple-700" : "text-slate-400"
                }`}
              >
                Categorías
              </ThemedText>
            </Pressable>
          </View>

          {tab === "productos" && (
            <>
              <View className="flex-row justify-between items-start mb-4">
                <ThemedText className="text-slate-950 text-2xl font-bold">
                  Productos Registrados
                </ThemedText>

                <ThemedText className="text-slate-400 text-xs">
                  {productosFiltrados.length} resultados
                </ThemedText>
              </View>

              {loading ? (
                <ActivityIndicator size="large" />
              ) : (
                <FlatList
                  data={productosFiltrados}
                  keyExtractor={(item) => String(item.idProducto)}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View className="h-4" />}
                  initialNumToRender={6}
                  maxToRenderPerBatch={6}
                  windowSize={5}
                  removeClippedSubviews
                  renderItem={({ item }) => (
                    <ProductoCard
                      producto={item}
                      onEdit={editarProducto}
                      onDelete={confirmarEliminarProducto}
                      onViewImages={setProductoImagenes}
                      deleting={productoAnimandoEliminar === item.idProducto}
                    />
                  )}
                />
              )}
            </>
          )}

          {tab === "categorias" && (
            <View className="bg-white rounded-[28px] p-4 shadow-sm border border-slate-100">
              <ThemedText className="text-slate-950 font-semibold mb-5">
                Listado de Categorías
              </ThemedText>

              <View className="flex-row border-b border-slate-100 pb-4">
                <ThemedText className="w-[20%] text-[11px] font-bold text-slate-500">
                  ICONO
                </ThemedText>

                <ThemedText className="w-[60%] text-[11px] font-bold text-slate-500">
                  NOMBRE DE LA CATEGORÍA
                </ThemedText>

                <ThemedText className="w-[20%] text-[11px] font-bold text-slate-500 text-right">
                  ACCIÓN
                </ThemedText>
              </View>

              {loading ? (
                <View className="py-10">
                  <ActivityIndicator size="large" color="#7e22ce" />
                </View>
              ) : (
                categoriasFiltradas.map((cat) => (
                  <View
                    key={cat.idCategoria}
                    className={`flex-row items-center border-b border-slate-100 py-5 ${
                      categoriaAnimandoEliminar === cat.idCategoria
                        ? "opacity-30"
                        : "opacity-100"
                    }`}
                  >
                    <View className="w-[20%]">
                      <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center">
                        <Ionicons
                          name="cube-outline"
                          size={20}
                          color="#0f172a"
                        />
                      </View>
                    </View>

                    <View className="w-[60%] pr-2">
                      <ThemedText className="text-slate-950 font-bold">
                        {cat.nombre}
                      </ThemedText>
                    </View>

                    <View className="w-[20%] flex-row justify-end items-center gap-4">
                      <Pressable
                        onPress={() => setCategoriaEditando(cat)}
                        className="w-9 h-9 rounded-full bg-slate-50 items-center justify-center"
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={18}
                          color="#0f172a"
                        />
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          confirmarEliminarCategoria(cat.idCategoria)
                        }
                        className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#ef4444"
                        />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute right-4 bottom-8 items-center gap-2">
        <Pressable
          onPress={async () => {
            await refetch();

            Toast.show({
              type: "success",
              text1: "Vista actualizada",
            });
          }}
          className="bg-slate-950 w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="refresh-outline" size={20} color="white" />
        </Pressable>

        <Pressable
          onPress={() => {
            if (tab === "productos") {
              abrirNuevoProducto();
            } else {
              abrirNuevaCategoria();
            }
          }}
          className="bg-purple-700 w-13 h-13 rounded-full items-center justify-center shadow-lg"
          style={{ width: 52, height: 52 }}
        >
          <Ionicons name="add" size={26} color="white" />
        </Pressable>
      </View>

      <Modal
        visible={productoEliminar !== null}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="bg-white w-full max-w-[420px] rounded-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
                <Ionicons name="trash-outline" size={30} color="#dc2626" />
              </View>
            </View>

            <ThemedText className="text-slate-950 text-xl font-bold text-center">
              Eliminar producto
            </ThemedText>

            <ThemedText className="text-slate-500 text-center mt-2">
              Esta acción no se puede deshacer.
            </ThemedText>

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={() => setProductoEliminar(null)}
                disabled={eliminando}
                className="flex-1 bg-slate-100 rounded-2xl py-4"
              >
                <ThemedText className="text-center font-bold">
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={eliminarProducto}
                disabled={eliminando}
                className="flex-1 bg-red-600 rounded-2xl py-4 items-center"
              >
                {eliminando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText className="text-white font-bold">
                    Eliminar
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={categoriaEliminar !== null}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="bg-white w-full max-w-[420px] rounded-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
                <Ionicons name="trash-outline" size={30} color="#dc2626" />
              </View>
            </View>

            <ThemedText className="text-slate-950 text-xl font-bold text-center">
              Eliminar categoría
            </ThemedText>

            <ThemedText className="text-slate-500 text-center mt-2">
              Esta acción no se puede deshacer.
            </ThemedText>

            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={() => setCategoriaEliminar(null)}
                disabled={eliminando}
                className="flex-1 bg-slate-100 rounded-2xl py-4"
              >
                <ThemedText className="text-center font-bold">
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={eliminarCategoria}
                disabled={eliminando}
                className="flex-1 bg-red-600 rounded-2xl py-4 items-center"
              >
                {eliminando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText className="text-white font-bold">
                    Eliminar
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={categoriaEditando !== null}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white w-full max-w-[430px] rounded-[28px] p-6 shadow-xl">
            <View className="items-center mb-5">
              <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center">
                <Ionicons
                  name={
                    categoriaEditando?.idCategoria === 0
                      ? "add"
                      : "create-outline"
                  }
                  size={32}
                  color="#7e22ce"
                />
              </View>
            </View>

            <ThemedText className="text-slate-950 text-2xl font-bold text-center">
              {categoriaEditando?.idCategoria === 0
                ? "Nueva categoría"
                : "Editar categoría"}
            </ThemedText>

            <ThemedText className="text-slate-500 text-center mt-2 mb-6">
              Ingresa el nombre de la categoría.
            </ThemedText>

            <CategoriaForm
              categoriaEditando={
                categoriaEditando?.idCategoria === 0 ? null : categoriaEditando
              }
              onCancel={() => setCategoriaEditando(null)}
              onSaved={async () => {
                setCategoriaEditando(null);

                Toast.show({
                  type: "success",
                  text1:
                    categoriaEditando?.idCategoria === 0
                      ? "Categoría creada"
                      : "Categoría actualizada",
                });

                await refetch();
              }}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={categoriaBloqueada !== null}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="bg-white w-full max-w-[460px] rounded-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
                <Ionicons
                  name="alert-circle-outline"
                  size={34}
                  color="#dc2626"
                />
              </View>
            </View>

            <ThemedText className="text-slate-950 text-xl font-bold text-center">
              No se puede eliminar
            </ThemedText>

            <ThemedText className="text-slate-500 text-center mt-2">
              La categoría `{categoriaBloqueada?.nombre}` tiene productos
              registrados. Primero cambia o elimina esos productos.
            </ThemedText>

            <View className="bg-slate-50 rounded-2xl mt-5 p-4 max-h-[260px]">
              <ThemedText className="text-slate-900 font-bold mb-3">
                Productos asociados
              </ThemedText>

              <ScrollView>
                {productosCategoriaBloqueada.map((producto) => (
                  <View
                    key={producto.idProducto}
                    className="flex-row items-center justify-between py-3 border-b border-slate-200"
                  >
                    <View className="flex-1 pr-3">
                      <ThemedText className="text-slate-950 font-semibold">
                        {producto.nombre}
                      </ThemedText>

                      <ThemedText className="text-slate-500 text-xs">
                        Bs. {producto.precio}
                      </ThemedText>
                    </View>

                    <Ionicons name="cube" size={20} color="#64748b" />
                  </View>
                ))}
              </ScrollView>
            </View>

            <Pressable
              onPress={() => {
                setCategoriaBloqueada(null);
                setProductosCategoriaBloqueada([]);
              }}
              className="bg-slate-950 rounded-2xl py-4 mt-6"
            >
              <ThemedText className="text-white text-center font-bold">
                Entendido
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
      <ProductoImagenesModal
        visible={productoImagenes !== null}
        producto={productoImagenes}
        onClose={() => setProductoImagenes(null)}
      />
      <ProductoModal
        visible={modalProducto}
        categorias={categorias}
        productoEditando={productoEditando}
        onClose={cerrarModalProducto}
        onSaved={async () => {
          cerrarModalProducto();
          await refetch();
        }}
      />
    </View>
  );
}
