// screens/catalogo/components/Shimmer.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { DimensionValue, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

interface ShimmerProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
}

export function Shimmer({ width, height, borderRadius = 8 }: ShimmerProps) {
  const translateX = useSharedValue(-100);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(100, { duration: 1200 }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            width: "100%",
            height: "100%",
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.5)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>
    </View>
  );
}
