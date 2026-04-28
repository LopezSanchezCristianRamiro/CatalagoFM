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
              className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
            >
              <ThemedText className="text-slate-950 text-xl font-bold">
                ×
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-4">
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
              onPress={onClose}
              disabled={guardando}
              className="bg-white border border-slate-300 rounded-full px-8 py-3"
            >
              <ThemedText className="text-slate-700 font-bold">
                Descartar
              </ThemedText>
            </Pressable>

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
        </View>
      </View>
    </Modal>
  );
}