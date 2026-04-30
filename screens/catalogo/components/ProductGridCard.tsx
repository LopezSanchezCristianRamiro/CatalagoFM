// screens/catalogo/components/ProductGridCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  Image,
  Platform,
  Pressable,
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProductGridCardProps {
  producto: ProductoCatalogo;
  onPress: () => void;
}

export function ProductGridCard({ producto, onPress }: ProductGridCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const borderProgress = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const feedbackOpacity = useSharedValue(0);
  const feedbackTranslateY = useSharedValue(0);
  const feedbackScale = useSharedValue(0.5);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(borderProgress.value, [0, 1], [0.8, 1]) }],
  }));

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

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [
      { translateY: feedbackTranslateY.value },
      { scale: feedbackScale.value },
    ],
  }));

  const handleMouseEnter = useCallback(() => {
    if (!isDesktop) return;
    scale.value = withSpring(1.02, { damping: 12, stiffness: 200 });
    glowOpacity.value = withSpring(1, { damping: 12, stiffness: 200 });
    borderProgress.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [isDesktop]);

  const handleMouseLeave = useCallback(() => {
    if (!isDesktop) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    glowOpacity.value = withSpring(0, { damping: 12, stiffness: 200 });
    borderProgress.value = withSpring(0, { damping: 12, stiffness: 200 });
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
      rotateX.value = withSpring(interpolate(y, [0, h], [10, -10]), {
        damping: 12,
        stiffness: 200,
      });
      rotateY.value = withSpring(interpolate(x, [0, w], [-10, 10]), {
        damping: 12,
        stiffness: 200,
      });
    },
    [isDesktop, rotateX, rotateY],
  );

  const handlePressIn = useCallback(() => {
    if (!isDesktop) {
      scale.value = withSpring(0.97, { damping: 12, stiffness: 200 });
      glowOpacity.value = withSpring(1, { damping: 12, stiffness: 200 });
      borderProgress.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [isDesktop]);

  const handlePressOut = useCallback(() => {
    if (!isDesktop) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      glowOpacity.value = withSpring(0, { damping: 12, stiffness: 200 });
      borderProgress.value = withSpring(0, { damping: 12, stiffness: 200 });
    }
  }, [isDesktop]);

  const playFeedbackAnimation = () => {
    feedbackOpacity.value = 1;
    feedbackTranslateY.value = 0;
    feedbackScale.value = 0.5;
    feedbackOpacity.value = withTiming(0, { duration: 1000 });
    feedbackTranslateY.value = withTiming(-50, { duration: 1000 });
    feedbackScale.value = withTiming(1.5, { duration: 1000 });
  };

  const handleAddToCart = () => {
    // Añadir el producto
    addToCart(producto as any);

    // Ocultar cualquier toast anterior
    Toast.hide();

    // Pequeño retardo para garantizar que el hide se complete antes de mostrar el nuevo
    setTimeout(() => {
      Toast.show({
        type: "success",
        text1: "Añadido al carrito",
        text2: `${producto.nombre} ha sido agregado al carrito.`,
        visibilityTime: 3000,
      });
    }, 100);

    // Animación visual "+1"
    playFeedbackAnimation();
  };

  const imageUrl =
    producto.fotos && producto.fotos.length > 0
      ? producto.fotos[0].urlFoto
      : null;

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
      style={cardStyle}
      accessibilityRole="button"
    >
      <View className="relative">
        {/* Glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            glowStyle,
            {
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 14,
              backgroundColor: "transparent",
              borderWidth: 2,
              borderColor: "#7C3AED55",
              shadowColor: "#7C3AED",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 10,
            },
          ]}
        />

        {/* Tarjeta */}
        <View className="bg-card rounded-xl overflow-hidden border border-border">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-36 bg-zinc-100"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-36 bg-zinc-200 items-center justify-center">
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </View>
          )}

          <View className="p-3">
            <ThemedText
              className="font-bold text-foreground text-base mb-1"
              numberOfLines={1}
            >
              {producto.nombre}
            </ThemedText>

            <View className="flex-row items-center justify-between mt-2">
              <View>
                {producto.precioDescuento ? (
                  <>
                    <ThemedText className="font-bold text-primary text-lg leading-tight">
                      Bs {producto.precioDescuento}
                    </ThemedText>
                    <ThemedText className="text-muted-foreground text-xs line-through leading-tight">
                      Bs {producto.precio}
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText className="font-bold text-primary text-lg">
                    Bs {producto.precio}
                  </ThemedText>
                )}
              </View>

              {/* Botón grande con ícono */}
              <View className="relative">
                <Pressable
                  onPress={handleAddToCart}
                  className="bg-violet-600 rounded-full w-12 h-12 items-center justify-center active:scale-90 shadow-lg"
                  accessibilityLabel="Agregar al carrito"
                >
                  <Ionicons name="add" size={28} color="white" />
                </Pressable>

                {/* Feedback "+1" */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    {
                      position: "absolute",
                      right: 0,
                      bottom: 48,
                    },
                    feedbackStyle,
                  ]}
                >
                  <ThemedText className="text-primary font-black text-2xl">
                    +1
                  </ThemedText>
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
