import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Categoria, Producto } from "../types/producto.types";
import ProductoForm, { ProductoFormRef } from "./ProductoForm";

type Props = {
  visible: boolean;
  categorias: Categoria[];
  productoEditando: Producto | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProductoModal({
  visible,
  categorias,
  productoEditando,
  onClose,
  onSaved,
}: Props) {
  const formRef = useRef<ProductoFormRef>(null);
  const [guardando, setGuardando] = useState(false);
const [formValido, setFormValido] = useState(false);
  const handleGuardar = async () => {
    if (guardando) return;

    try {
      setGuardando(true);
      await formRef.current?.guardar();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <View className="bg-[#fff8f8] rounded-3xl w-full max-w-[820px] h-[92%] overflow-hidden">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200">
            <ThemedText className="text-slate-950 text-xl font-bold">
              {productoEditando ? "Editar producto" : "Nuevo producto"}
            </ThemedText>

       <Pressable
  onPress={onClose}
  disabled={guardando}
  className={`rounded-full px-8 py-3 border ${
    guardando
      ? "bg-slate-100 border-slate-200 opacity-35"
      : "bg-white border-slate-900 opacity-100"
  }`}
>
  <ThemedText
    className={`font-bold ${
      guardando ? "text-slate-400" : "text-slate-700"
    }`}
  >
    Cerrar Ventana
  </ThemedText>
</Pressable>
          </View>

          <ScrollView
  className="flex-1 p-4"
  scrollEnabled={!guardando}
>
            <ProductoForm
               ref={formRef}
  categorias={categorias}
  productoEditando={productoEditando}
  onCancel={onClose}
  onSaved={onSaved}
  onValidityChange={setFormValido}
            />
          </ScrollView>

          <View className="flex-row justify-end gap-3 px-6 py-4 bg-white border-t border-slate-200">
           
            <Pressable
  onPress={handleGuardar}
  disabled={guardando || !formValido}
  className={`rounded-full px-8 py-3 min-w-[110px] items-center ${
    guardando || !formValido ? "bg-slate-300" : "bg-slate-950"
  }`}
>
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText className="text-white font-bold">
                  Guardar
                </ThemedText>
              )}
            </Pressable>
          </View>
           {guardando && (
            <View className="absolute inset-0 bg-white/70 rounded-3xl items-center justify-center z-50">
              <ActivityIndicator size="large" color="#7e22ce" />

              <ThemedText className="text-slate-700 font-bold mt-4">
                Guardando producto...
              </ThemedText>

              <ThemedText className="text-slate-500 text-sm mt-1">
                Espera un momento
              </ThemedText>
            </View>
          )}
        
        </View>
      </View>
    </Modal>
  );
}