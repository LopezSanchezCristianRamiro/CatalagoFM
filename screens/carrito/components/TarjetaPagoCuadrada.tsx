// screens/carrito/components/TarjetaPagoCuadrada.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

interface TarjetaPagoCuadradaProps {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  onPress: () => void;
}

export function TarjetaPagoCuadrada({
  icon,
  titulo,
  onPress,
}: TarjetaPagoCuadradaProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-card border border-border rounded-[28px] w-[150px] h-[150px] items-center justify-center shadow-sm active:bg-secondary/10 active:scale-95"
    >
      <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-3">
        <Ionicons name={icon} size={32} color="#7C3AED" />
      </View>
      <ThemedText className="font-bold text-base text-center px-2">
        {titulo}
      </ThemedText>
    </Pressable>
  );
}
