import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Producto } from "../types/producto.types";
import ProductoEstadoSwitch from "./ProductoEstadoSwitch";

type Props = {
  producto: Producto;
  onEdit: (producto: Producto) => void;
  onViewImages: (producto: Producto) => void;
  onChangeEstado: (producto: Producto) => void;
  deleting?: boolean;
};

export default function ProductoCard({
  producto,
  onEdit,
  onViewImages,
  onChangeEstado,
  deleting = false,
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;

  const fotos = producto.fotos ?? [];
  const fotoPrincipal = fotos[0]?.urlFoto;
  const estaActivado = producto.estado === "activado";

  useEffect(() => {
    if (deleting) {
      Animated.parallel([
        Animated.timing(cardScale, {
          toValue: 0.82,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 18,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      cardScale.setValue(1);
      cardOpacity.setValue(1);
      cardTranslateY.setValue(0);
    }
  }, [deleting, cardScale, cardOpacity, cardTranslateY]);

  return (
    <Animated.View
      style={{
        opacity: cardOpacity,
        transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
      }}
      className={`bg-white rounded-2xl p-4 shadow-sm border ${
        estaActivado ? "border-slate-100" : "border-red-100 opacity-70"
      }`}
    >
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden mr-4 items-center justify-center">
          {fotoPrincipal ? (
            <Image
              source={{ uri: fotoPrincipal }}
              className="w-full h-full"
              resizeMode="cover"
              fadeDuration={0}
            />
          ) : (
            <Ionicons name="image-outline" size={24} color="#38bdf8" />
          )}
        </View>

        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2">
            <ThemedText className="text-slate-950 font-semibold">
              {producto.nombre}
            </ThemedText>

            <View
              className={`px-2 py-1 rounded-full ${
                estaActivado ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <ThemedText
                className={`text-[10px] font-bold ${
                  estaActivado ? "text-green-700" : "text-red-700"
                }`}
              >
                {estaActivado ? "Activado" : "Desactivado"}
              </ThemedText>
            </View>
          </View>

          <ThemedText className="text-slate-400 text-xs">
            {producto.categoria?.nombre ?? "Sin categoría"}
          </ThemedText>

          <ThemedText className="text-purple-700 font-bold mt-1">
            Bs. {producto.precioDescuento ?? producto.precio}
          </ThemedText>

          {fotos.length > 0 && (
            <ThemedText className="text-slate-400 text-xs mt-1">
              {fotos.length} imagen{fotos.length === 1 ? "" : "es"}
            </ThemedText>
          )}
        </View>

        <View className={`flex-row items-center ${isMobile ? "gap-3" : "gap-4"}`}>
          <Pressable
            onPress={() => onEdit(producto)}
            disabled={deleting}
            className={`${
              isMobile ? "w-12 h-12" : "w-11 h-11"
            } bg-slate-100 rounded-xl items-center justify-center`}
          >
            <Ionicons name="pencil" size={18} color="#111827" />
          </Pressable>

          <Pressable
            onPress={() => onViewImages(producto)}
            disabled={deleting}
            className={`${
              isMobile ? "w-12 h-12" : "w-11 h-11"
            } bg-purple-50 rounded-xl items-center justify-center`}
          >
            <Ionicons name="images-outline" size={19} color="#7e22ce" />
          </Pressable>

          <ProductoEstadoSwitch
            estado={producto.estado}
            onPress={() => onChangeEstado(producto)}
          />
        </View>
      </View>
    </Animated.View>
  );
}