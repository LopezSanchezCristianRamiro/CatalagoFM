import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { ThemedText } from "../../../components/ThemedText";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TarjetaPagoProps {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descripcion: string;
  onPress: () => void;
}

export function TarjetaPago({
  icon,
  titulo,
  descripcion,
  onPress,
}: TarjetaPagoProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      style={animatedStyle}
      className="bg-card border border-border rounded-2xl p-5 flex-row items-center gap-4 active:shadow-sharp"
    >
      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
        <Ionicons name={icon} size={24} color="#7C3AED" />
      </View>
      <View className="flex-1">
        <ThemedText className="text-foreground font-bold text-base">
          {titulo}
        </ThemedText>
        <ThemedText className="text-muted-foreground text-sm">
          {descripcion}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </AnimatedPressable>
  );
}
