import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
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

export function ProductGridCard({ producto, onPress }: { producto: ProductoCatalogo; onPress: () => void }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { triggerFly } = useCartAnimation();
  const cardRef = useRef<View>(null);

  // Animaciones
  const scale = useSharedValue(1);
  const imageScale = useSharedValue(1);
  const feedbackOpacity = useSharedValue(0);
  const feedbackTranslateY = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const feedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ translateY: feedbackTranslateY.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
    imageScale.value = withTiming(1.12, { duration: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    imageScale.value = withTiming(1, { duration: 400 });
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart(producto as any);
    Toast.show({ type: "success", text1: "¡Añadido!", visibilityTime: 1500 });
    
    // Feedback +1
    feedbackOpacity.value = 1;
    feedbackTranslateY.value = 0;
    feedbackOpacity.value = withTiming(0, { duration: 800 });
    feedbackTranslateY.value = withTiming(-40, { duration: 800 });

    cardRef.current?.measureInWindow((x, y, w, h) => {
      triggerFly(x, y, w, h, producto.fotos?.[0]?.urlFoto ?? undefined);
    });
  };

  const imageUrl = producto.fotos?.[0]?.urlFoto;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="w-full p-2"
      style={[cardStyle, { aspectRatio: 1.6 }]}
    >
      <View 
        ref={cardRef} 
        collapsable={false}
        className="relative bg-zinc-900 rounded-[32px] overflow-hidden h-48 shadow-xl shadow-black/40"
      >
        {/* IMAGEN CON ZOOM */}
        {imageUrl ? (
          <Animated.Image 
            source={{ uri: imageUrl }} 
            style={[{ width: '100%', height: '100%', position: 'absolute' }, imageStyle]}
            resizeMode="cover"
          />
        ) : (
          <View className="absolute inset-0 items-center justify-center bg-zinc-800">
            <Ionicons name="image-outline" size={40} color="#444" />
          </View>
        )}

        {/* GRADIENTE CORTO (No tapa el logo arriba) */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.6, 1]}
          className="absolute inset-0"
        />

        {/* CONTENIDO MINIMALISTA Y CENTRADO */}
        <View className="flex-1 justify-end px-5 pb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <ThemedText 
                className="text-white/70 font-semibold text-[11px] mb-0.5 uppercase tracking-wider"
                numberOfLines={1}
                style={{ textShadowColor: 'black', textShadowRadius: 3 }}
              >
                {producto.nombre}
              </ThemedText>
              <ThemedText 
                className="text-white font-black text-lg leading-none"
                style={{ textShadowColor: 'black', textShadowRadius: 3 }}
              >
                Bs {producto.precioDescuento || producto.precio}
              </ThemedText>
            </View>

            {/* BOTÓN CARRITO */}
            <View className="relative">
              <Pressable
                onPress={handleAddToCart}
                className="w-10 h-10 rounded-full items-center justify-center active:scale-75 overflow-hidden shadow-lg"
              >
                <LinearGradient
                  colors={["#8B5CF6", "#D946EF"]} 
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="cart" size={18} color="white" />
              </Pressable>
              <Animated.View pointerEvents="none" style={[{ position: "absolute", top: -18, right: 0 }, feedbackStyle]}>
                <ThemedText className="text-violet-300 font-bold text-xs">+1</ThemedText>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}