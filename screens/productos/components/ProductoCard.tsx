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
  const precioMostrar = producto.precioDescuento ?? producto.precio;

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

  if (!isMobile) {
    return (
      <Animated.View
        style={{
          opacity: cardOpacity,
          transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
        }}
        className={`w-full py-5 ${
          estaActivado ? "opacity-100" : "opacity-60"
        }`}
      >
        <View className="flex-row items-center">
          <View className="w-[88px] h-[88px] rounded-2xl bg-slate-900 overflow-hidden mr-6 items-center justify-center">
            {fotoPrincipal ? (
              <Image
                source={{ uri: fotoPrincipal }}
                className="w-full h-full"
                resizeMode="cover"
                fadeDuration={0}
              />
            ) : (
              <Ionicons name="image-outline" size={26} color="#38bdf8" />
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <ThemedText
                numberOfLines={1}
                className="text-slate-950 font-bold text-lg"
              >
                {producto.nombre}
              </ThemedText>

              <View
                className={`px-3 py-1 rounded-full ${
                  estaActivado ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <ThemedText
                  className={`text-xs font-extrabold ${
                    estaActivado ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {estaActivado ? "Activado" : "Desactivado"}
                </ThemedText>
              </View>
            </View>

            <ThemedText className="text-slate-400 mt-1">
              {producto.categoria?.nombre ?? "Sin categoría"}
            </ThemedText>

            <ThemedText className="text-purple-700 font-extrabold mt-2 text-lg">
              Bs. {precioMostrar}
            </ThemedText>

            <ThemedText className="text-slate-400 mt-1">
              {fotos.length} imagen{fotos.length === 1 ? "" : "es"}
            </ThemedText>
          </View>

          <View className="flex-row items-center gap-6">
            <Pressable
              onPress={() => onEdit(producto)}
              disabled={deleting}
              className="w-16 h-16 bg-slate-100 rounded-2xl items-center justify-center"
            >
              <Ionicons name="pencil" size={23} color="#111827" />
            </Pressable>

            <Pressable
              onPress={() => onViewImages(producto)}
              disabled={deleting}
              className="w-16 h-16 bg-purple-50 rounded-2xl items-center justify-center"
            >
              <Ionicons name="images-outline" size={25} color="#7e22ce" />
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

  return (
    <Animated.View
      style={{
        opacity: cardOpacity,
        transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
      className={`bg-white border-2 rounded-[28px] px-4 py-4 ${
        estaActivado ? "border-slate-200" : "border-red-200 opacity-75"
      }`}
    >
      <View className="flex-row items-start">
        <View className="w-[74px] h-[74px] rounded-2xl bg-slate-900 overflow-hidden mr-4 items-center justify-center border border-slate-200">
          {fotoPrincipal ? (
            <Image
              source={{ uri: fotoPrincipal }}
              className="w-full h-full"
              resizeMode="cover"
              fadeDuration={0}
            />
          ) : (
            <Ionicons name="image-outline" size={26} color="#38bdf8" />
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1 pr-1">
              <ThemedText
                numberOfLines={3}
                className="text-slate-950 font-bold text-[14px] leading-5"
              >
                {producto.nombre}
              </ThemedText>

              <ThemedText
                numberOfLines={1}
                className="text-slate-400 text-xs mt-1"
              >
                {producto.categoria?.nombre ?? "Sin categoría"}
              </ThemedText>
            </View>

            <View
              className={`px-3 py-1.5 rounded-full border ${
                estaActivado
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <ThemedText
                className={`text-[10px] font-extrabold ${
                  estaActivado ? "text-green-700" : "text-red-700"
                }`}
              >
                {estaActivado ? "ACTIVO" : "INACTIVO"}
              </ThemedText>
            </View>
          </View>

          <ThemedText className="text-purple-700 font-extrabold mt-2">
            Bs. {precioMostrar}
          </ThemedText>

          <ThemedText className="text-slate-400 text-xs mt-1">
            {fotos.length} imagen{fotos.length === 1 ? "" : "es"}
          </ThemedText>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-5 pt-4 border-t border-slate-200">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => onEdit(producto)}
            disabled={deleting}
            className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-2xl items-center justify-center"
          >
            <Ionicons name="pencil-outline" size={20} color="#111827" />
          </Pressable>

          <Pressable
            onPress={() => onViewImages(producto)}
            disabled={deleting}
            className="w-11 h-11 bg-purple-50 border border-purple-100 rounded-2xl items-center justify-center"
          >
            <Ionicons name="images-outline" size={20} color="#7e22ce" />
          </Pressable>
        </View>

        <ProductoEstadoSwitch
          estado={producto.estado}
          onPress={() => onChangeEstado(producto)}
        />
      </View>
    </Animated.View>
  );
}