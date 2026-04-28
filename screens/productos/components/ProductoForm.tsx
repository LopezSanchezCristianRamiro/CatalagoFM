import * as ImagePicker from "expo-image-picker";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Image, Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { uploadImageToImgbb } from "../services/imgbbService";
import { productoService } from "../services/productoService";
import { Categoria, Producto } from "../types/producto.types";
type Props = {
  categorias: Categoria[];
  productoEditando: Producto | null;
  onSaved: () => void;
  onCancel: () => void;
  onValidityChange?: (isValid: boolean) => void;
};

export type ProductoFormRef = {
  guardar: () => void;
};

const ProductoForm = forwardRef(function ProductoForm({
  categorias,
  productoEditando,
  onSaved,
  onCancel,
  onValidityChange,
}: Props, ref) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioDescuento, setPrecioDescuento] = useState("");
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [imagenesUri, setImagenesUri] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [modalCategorias, setModalCategorias] = useState(false);
const [imagenPrincipalError, setImagenPrincipalError] = useState(false);
  const categoriaSeleccionada = categorias.find(
    (cat) => cat.idCategoria === idCategoria
  );
const precioNumero = Number(precio);
const precioDescuentoNumero = precioDescuento ? Number(precioDescuento) : null;

const nombreValido = nombre.trim().length >= 3;
const precioValido = !!precio && !isNaN(precioNumero) && precioNumero > 0;
const descuentoValido =
  !precioDescuento ||
  (!isNaN(Number(precioDescuento)) && Number(precioDescuento) > 0);
const categoriaValida = !!idCategoria;

const formValido =
  nombreValido &&
  precioValido &&
  descuentoValido &&
  categoriaValida &&
  !guardando;
  useEffect(() => {
  onValidityChange?.(formValido);
}, [formValido, onValidityChange]);
  useEffect(() => {
    if (productoEditando) {
      setNombre(productoEditando.nombre);
      setDescripcion(productoEditando.descripcion ?? "");
      setPrecio(String(productoEditando.precio));
      setPrecioDescuento(
        productoEditando.precioDescuento
          ? String(productoEditando.precioDescuento)
          : ""
      );
      setIdCategoria(productoEditando.idCategoria);
      setImagenesUri(productoEditando.fotos?.map((foto) => foto.urlFoto) ?? []);
    } else {
      limpiar();
    }
  }, [productoEditando]);

  const limpiar = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setPrecioDescuento("");
    setIdCategoria(null);
    setImagenesUri([]);
  };

  const seleccionarImagenes = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsMultipleSelection: true,
    selectionLimit: 0,
  });

  if (!result.canceled) {
    setImagenPrincipalError(false);

    const nuevasImagenes = result.assets
      .map((asset) => asset.uri)
      .filter(Boolean)
      .map((uri) =>
        uri.startsWith("content://")
          ? uri
          : uri.replace("file://", "file:///")
      );

    setImagenesUri((prev) => {
      const combinadas = [...prev, ...nuevasImagenes];
      return Array.from(new Set(combinadas));
    });
  }
};

  const guardar = async () => {
    try {
if (!formValido) {
       Toast.show({
  type: "error",
  text1: "Datos incompletos",
  text2: "Completa nombre, precio válido y categoría",
});
        return;
      }

      setGuardando(true);

      const urlFotos =
        imagenesUri.length > 0
          ? await Promise.all(
              imagenesUri.map((uri) =>
                uri.startsWith("http")
                  ? Promise.resolve(uri)
                  : uploadImageToImgbb(uri)
              )
            )
          : [];

      const payload = {
        nombre,
        descripcion,
        precio: Number(precio),
        precioDescuento: precioDescuento ? Number(precioDescuento) : null,
        idCategoria,
        urlFotos,
      };

      if (productoEditando) {
        await productoService.updateProducto(productoEditando.idProducto, payload);
      } else {
        await productoService.createProducto(payload);
      }

      Toast.show({
  type: "success",
  text1: productoEditando ? "Producto actualizado" : "Producto creado",
  text2: "El producto se guardó correctamente",
});
      limpiar();
      onSaved();
    } catch (error: any) {
     Toast.show({
  type: "error",
  text1: "Error",
  text2: error?.message ?? "No se pudo guardar",
});
    } finally {
      setGuardando(false);
    }
  };
useImperativeHandle(ref, () => ({
  guardar,
}));

  return (
    <View className="bg-[#fcf7f7] rounded-3xl p-6 border border-slate-200 shadow-lg">
      <ThemedText className="text-slate-900 text-2xl font-bold mb-6">
        {productoEditando ? "Editar App" : "Nueva App"}
      </ThemedText>

      <View className="flex-row flex-wrap gap-8">
        <View className="w-56">
          <ThemedText className="text-slate-900 text-xs font-bold mb-3">
            LOGO DE LA APP
          </ThemedText>

          <Pressable
            onPress={seleccionarImagenes}
            className="h-48 rounded-2xl border-2 border-dashed border-slate-300 bg-white items-center justify-center overflow-hidden"
          >
           {imagenesUri[0] && !imagenPrincipalError ? (
  <Image
  source={{ uri: imagenesUri[0] }}
  style={{
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
  }}
  resizeMode="cover"
/>
) : (
              <>
                <ThemedText className="text-3xl text-slate-400">☁</ThemedText>
                <ThemedText className="text-slate-500 text-xs text-center mt-2 px-4">
                  Haz clic para subir una o varias imágenes
                </ThemedText>
              </>
            )}
          </Pressable>

         {imagenesUri.length > 0 && (
  <View className="mt-4">
    <ThemedText className="text-slate-900 text-xs font-bold mb-2">
      Imágenes seleccionadas
    </ThemedText>

    <ThemedText className="text-slate-500 text-xs mb-3">
      La primera imagen será la principal del producto.
    </ThemedText>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-3">
        {imagenesUri.map((uri, index) => (
          <View
            key={`${uri}-${index}`}
            className="relative"
          >
            <Pressable
              onPress={() => {
                if (index === 0) return;

                const copia = [...imagenesUri];
                const seleccionada = copia[index];

                copia.splice(index, 1);
                copia.unshift(seleccionada);

                setImagenesUri(copia);
              }}
              className={`rounded-2xl overflow-hidden border-2 ${
                index === 0
                  ? "border-green-500"
                  : "border-slate-200"
              }`}
            >
             <Image
  source={{ uri }}
  style={{
    width: 96,
    height: 96,
    backgroundColor: "#f1f5f9",
  }}
  resizeMode="cover"
/>
            </Pressable>

            {index === 0 && (
              <View className="absolute left-1 right-1 top-1 bg-green-600 rounded-lg px-2 py-1">
                <ThemedText className="text-white text-[10px] text-center font-bold">
                  PRINCIPAL
                </ThemedText>
              </View>
            )}

            {index !== 0 && (
              <View className="absolute left-1 right-1 top-1 bg-black/60 rounded-lg px-1 py-1">
                <ThemedText className="text-white text-[10px] text-center">
                  Tocar para principal
                </ThemedText>
              </View>
            )}

            <Pressable
              onPress={() => {
                setImagenesUri((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
              className="absolute bottom-1 right-1 bg-red-600 w-6 h-6 rounded-full items-center justify-center"
            >
              <ThemedText className="text-white text-xs font-bold">
                ×
              </ThemedText>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
)}
        </View>

        <View className="flex-1 min-w-[280px] gap-4">
          <View>
            <ThemedText className="text-slate-900 text-xs font-semibold mb-2">
              Título de la App
            </ThemedText>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: StreamSub Premium"
              placeholderTextColor="#94a3b8"
              className="bg-white text-slate-900 rounded-xl px-4 py-4"
            />
            {nombre.length > 0 && !nombreValido && (
  <ThemedText className="text-red-500 text-xs mt-1">
    El título debe tener al menos 3 caracteres.
  </ThemedText>
)}
          </View>

          <View>
            <ThemedText className="text-slate-900 text-xs font-semibold mb-2">
              Categoría
            </ThemedText>

            <Pressable
              onPress={() => setModalCategorias(true)}
              className="bg-white rounded-xl px-4 py-4 flex-row justify-between items-center"
            >
              <ThemedText
                className={
                  categoriaSeleccionada ? "text-slate-900" : "text-slate-400"
                }
              >
                {categoriaSeleccionada?.nombre ?? "Seleccionar categoría"}
              </ThemedText>

              <ThemedText className="text-slate-500">⌄</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-6 mt-8 shadow-sm">
        <ThemedText className="text-slate-900 text-xl font-bold mb-6">
          Precios
        </ThemedText>

        <View className="flex-row flex-wrap gap-6">
          <View className="flex-1 min-w-[220px]">
            <ThemedText className="text-slate-900 text-xs font-semibold mb-2">
              Precio Normal (Bs.)
            </ThemedText>
            <TextInput
              placeholder="Ej: 14.99"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={precio}
              onChangeText={setPrecio}
              className="bg-white text-slate-900 rounded-xl px-4 py-4 border border-slate-100"
            />
            {precio.length > 0 && !precioValido && (
  <ThemedText className="text-red-500 text-xs mt-1">
    Ingresa un precio válido mayor a 0.
  </ThemedText>
)}
          </View>

          <View className="flex-1 min-w-[220px]">
            <ThemedText className="text-purple-700 text-xs font-semibold mb-2">
              Precio con Descuento (Opcional)
            </ThemedText>
            <TextInput
              placeholder="Ej: 9.99"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={precioDescuento}
              onChangeText={setPrecioDescuento}
              className="bg-purple-50 text-slate-900 rounded-xl px-4 py-4"
            />
            {precioDescuento.length > 0 && !descuentoValido && (
  <ThemedText className="text-red-500 text-xs mt-1">
    Ingresa un descuento válido.
  </ThemedText>
)}
          </View>
        </View>
      </View>

      <View className="mt-8">
        <View className="flex-row justify-between mb-3">
          <ThemedText className="text-slate-900 text-xl font-bold">
            Descripción Detallada
          </ThemedText>
          <ThemedText className="text-slate-500 text-xs">
            {descripcion.length}/2000 caracteres
          </ThemedText>
        </View>

        <TextInput
          placeholder="Describe las características principales, beneficios y requerimientos..."
          placeholderTextColor="#94a3b8"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          maxLength={2000}
          textAlignVertical="top"
          className="bg-white text-slate-900 rounded-xl px-4 py-4 h-40"
        />
      </View>


      <Modal visible={modalCategorias} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center px-4">
          <View className="bg-white rounded-2xl w-full max-w-[420px] p-4">
            <ThemedText className="text-slate-950 text-xl font-bold mb-4">
              Seleccionar categoría
            </ThemedText>

            {categorias.map((cat) => (
              <Pressable
                key={cat.idCategoria}
                onPress={() => {
                  setIdCategoria(cat.idCategoria);
                  setModalCategorias(false);
                }}
                className="py-4 border-b border-slate-100"
              >
                <ThemedText className="text-slate-900">
                  {cat.nombre}
                </ThemedText>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setModalCategorias(false)}
              className="bg-slate-900 rounded-xl py-3 mt-4"
            >
              <ThemedText className="text-white text-center font-bold">
                Cerrar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default ProductoForm as React.ForwardRefExoticComponent<
  Props & React.RefAttributes<ProductoFormRef>
>;