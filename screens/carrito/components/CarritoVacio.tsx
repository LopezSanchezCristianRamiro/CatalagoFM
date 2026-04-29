import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

export function CarritoVacio() {
  return (
    <View className="flex-1 items-center justify-center bg-background gap-3">
      <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
      <ThemedText className="text-muted-foreground text-lg">
        Tu carrito está vacío
      </ThemedText>
    </View>
  );
}