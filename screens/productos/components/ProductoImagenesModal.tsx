import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Modal, Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Producto } from "../types/producto.types";

type Props = {
  visible: boolean;
  producto: Producto | null;
  onClose: () => void;
};

export default function ProductoImagenesModal({
  visible,
  producto,
  onClose,
}: Props) {
  const fotos = producto?.fotos ?? [];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-4">
        <View className="bg-white w-full max-w-[760px] rounded-3xl overflow-hidden">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200">
            <View className="flex-1 pr-3">
              <ThemedText className="text-slate-950 text-xl font-bold">
                Imágenes del producto
              </ThemedText>

              <ThemedText className="text-slate-500 text-sm">
                {producto?.nombre ?? ""}
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#0f172a" />
            </Pressable>
          </View>

          <View className="p-5">
            {fotos.length > 0 ? (
             <ScrollView
  horizontal
  showsHorizontalScrollIndicator={true}
  contentContainerStyle={{
    paddingRight: 24,
    gap: 16,
  }}
>
  {fotos.map((foto, index) => (
    <View key={foto.idFotoProducto ?? index} style={{ width: 280 }}>
      <Image
        source={{ uri: foto.urlFoto }}
        style={{
          width: 280,
          height: 190,
          borderRadius: 22,
          backgroundColor: "#e2e8f0",
        }}
        resizeMode="cover"
        fadeDuration={0}
      />

      <ThemedText className="text-slate-500 text-xs text-center mt-2">
        Imagen {index + 1}
      </ThemedText>
    </View>
  ))}
</ScrollView>
            ) : (
              <View className="h-52 items-center justify-center">
                <Ionicons name="image-outline" size={46} color="#94a3b8" />

                <ThemedText className="text-slate-500 mt-3">
                  Este producto no tiene imágenes.
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}