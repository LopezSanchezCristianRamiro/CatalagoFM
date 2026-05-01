// screens/catalogo/components/ProductGridCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { useCartStore } from "../../../store/cartStore";
import type { ProductoCatalogo } from "../types/catalogo.types";
import { useCartAnimation } from "./CartAnimationContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProductGridCardProps {
  producto: ProductoCatalogo;
  onPress: () => void;
}

export function ProductGridCard({ producto, onPress }: ProductGridCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { triggerFly } = useCartAnimation();
  const cardRef = useRef<View>(null);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  // Valores compartidos para animaciones
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  // Feedback "+1"
  const feedbackOpacity = useSharedValue(0);
  const feedbackTranslateY = useSharedValue(0);
  const feedbackScale = useSharedValue(0.5);

  // Estilo de la tarjeta con escala y rotación 3D
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      ...(isDesktop
        ? [
            { perspective: 1000 },
            { rotateX: `${rotateX.value}deg` },
            { rotateY: `${rotateY.value}deg` },
          ]
        : []),
    ],
  }));

  // Feedback "+1"
  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [
      { translateY: feedbackTranslateY.value },
      { scale: feedbackScale.value },
    ],
  }));

  // Handlers de interacción (mouse + touch)
  const handleMouseEnter = useCallback(() => {
    if (!isDesktop) return;
    scale.value = withSpring(1.2, { damping: 12, stiffness: 200 });
  }, [isDesktop]);

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    rotateX.value = withSpring(0, { damping: 12, stiffness: 200 });
    rotateY.value = withSpring(0, { damping: 12, stiffness: 200 });
  }, [isDesktop]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDesktop) return;
      const {
        left,
        top,
        width: w,
        height: h,
      } = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      rotateX.value = withSpring(interpolate(y, [0, h], [15, -15]), {
        damping: 12,
        stiffness: 200,
      });
      rotateY.value = withSpring(interpolate(x, [0, w], [-15, 15]), {
        damping: 12,
        stiffness: 200,
      });
    },
    [isDesktop, rotateX, rotateY],
  );

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 12, stiffness: 200 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  const playFeedbackAnimation = () => {
    feedbackOpacity.value = 1;
    feedbackTranslateY.value = 0;
    feedbackScale.value = 0.5;
    feedbackOpacity.value = withTiming(0, { duration: 800 });
    feedbackTranslateY.value = withTiming(-40, { duration: 800 });
    feedbackScale.value = withTiming(1.5, { duration: 800 });
  };

  const handleAddToCart = (e: any) => {
  e.stopPropagation?.();

  if (producto.estado === "desactivado") {
    Toast.hide();

    Toast.show({
      type: "error",
      text1: "Producto no disponible",
      text2: `${producto.nombre} no está disponible por el momento.`,
      visibilityTime: 3000,
    });

    return;
  }

  addToCart(producto as any);

  Toast.hide();
  setTimeout(() => {
    Toast.show({
      type: "success",
      text1: "Añadido al carrito",
      text2: `${producto.nombre} ha sido agregado al carrito.`,
      visibilityTime: 3000,
    });
  }, 100);

  playFeedbackAnimation();

  if (cardRef.current) {
    cardRef.current.measureInWindow((x, y, w, h) => {
      triggerFly(x, y, w, h, producto.fotos?.[0]?.urlFoto ?? undefined);
    });
  }
};

  const imageUrl = producto.fotos?.[0]?.urlFoto;
  const tieneDescuento = producto.precioDescuento != null;
  const descuentoPorcentaje = tieneDescuento
    ? Math.round(
        ((producto.precio - producto.precioDescuento!) / producto.precio) * 100,
      )
    : 0;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...(isDesktop
        ? {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onMouseMove: handleMouseMove,
          }
        : {})}
      className="w-full p-2"
      style={[cardStyle, { aspectRatio: 1.6 }]}
      accessibilityRole="button"
    >
      <View
        ref={cardRef}
        collapsable={false}
        className="relative bg-zinc-900 rounded-[32px] overflow-hidden h-48 shadow-xl shadow-black/40"
      >
        {/* Imagen de fondo con zoom suave */}
        {imageUrl ? (
          <Animated.Image
            source={{ uri: imageUrl }}
            style={[{ width: "100%", height: "100%", position: "absolute" }]}
            resizeMode="cover"
          />
        ) : (
          <View className="absolute inset-0 items-center justify-center bg-zinc-800">
            <Ionicons name="image-outline" size={40} color="#444" />
          </View>
        )}

        {/* Gradiente inferior */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.6, 1]}
          className="absolute inset-0"
        />

        {/* Contenido textual */}
        <View className="flex-1 justify-end px-5 pb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <ThemedText
                className="text-white/70 font-semibold text-[11px] mb-0.5 uppercase tracking-wider"
                numberOfLines={1}
                style={{ textShadowColor: "black", textShadowRadius: 3 }}
              >
                {producto.nombre}
              </ThemedText>
              {tieneDescuento ? (
                <View className="flex-row items-baseline gap-2">
                  <ThemedText
                    className="text-white font-black text-lg leading-none"
                    style={{ textShadowColor: "black", textShadowRadius: 3 }}
                  >
                    Bs {producto.precioDescuento}
                  </ThemedText>
                  <ThemedText
                    className="text-white/50 text-xs line-through"
                    style={{ textShadowColor: "black", textShadowRadius: 2 }}
                  >
                    Bs {producto.precio}
                  </ThemedText>
                  <View className="bg-[#D946EF] px-2 py-0.5 rounded-full ml-auto">
                    <ThemedText className="text-white font-black text-[10px]">
                      -{descuentoPorcentaje}%
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <ThemedText
                  className="text-white font-black text-lg leading-none"
                  style={{ textShadowColor: "black", textShadowRadius: 3 }}
                >
                  Bs {producto.precio}
                </ThemedText>
              )}
            </View>

            {/* Botón de carrito con gradiente */}
            <View className="relative">
              <Pressable
                onPress={handleAddToCart}
                className="w-10 h-10 rounded-full items-center justify-center active:scale-75 overflow-hidden shadow-lg"
              >
                <LinearGradient
                  colors={["#8B5CF6", "#D946EF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="cart" size={18} color="white" />
              </Pressable>

              {/* Indicador "+1" */}
              <Animated.View
                pointerEvents="none"
                style={[
                  { position: "absolute", top: -18, right: 0 },
                  feedbackStyle,
                ]}
              >
                <ThemedText className="text-violet-300 font-bold text-xs">
                  +1
                </ThemedText>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
