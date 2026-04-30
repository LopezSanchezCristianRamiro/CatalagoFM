import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useCartAnimation } from "./CartAnimationContext";

export function FlyingBubble() {
  const { flyState, resetFly } = useCartAnimation();

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!flyState.visible) return;

    // Empieza EXACTAMENTE donde está el card
    x.value = flyState.fromX;
    y.value = flyState.fromY;
    scale.value = 1;
    opacity.value = 1;

    // Vuela hacia el carrito encogiéndose
    x.value = withSpring(flyState.toX - flyState.cardW / 2, {
      damping: 16,
      stiffness: 100,
    });
    y.value = withSpring(flyState.toY - flyState.cardH / 2, {
      damping: 16,
      stiffness: 100,
    });
    scale.value = withTiming(0, { duration: 500 });
    opacity.value = withTiming(0, { duration: 450 }, (done) => {
      if (done) runOnJS(resetFly)();
    });
  }, [flyState]);

  const wrapStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: x.value,
    top: y.value,
    width: flyState.cardW,
    height: flyState.cardH,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 9999,
  }));

  if (!flyState.visible) return null;

  return (
    <Animated.View style={wrapStyle} pointerEvents="none">
      {/* Imagen del producto volando */}
      {flyState.imageUrl ? (
        <Image
          source={{ uri: flyState.imageUrl }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#18181b",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="cart" size={32} color="#BC4ED8" />
        </View>
      )}
      {/* Mismo degradado que el card original */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </Animated.View>
  );
}
