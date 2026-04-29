import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

interface ResumenPedidoProps {
  subtotal: number;
  loading: boolean;
  onPress: () => void;
  buttonText: string;
  isDesktop?: boolean;
}

export function ResumenPedido({
  subtotal,
  loading,
  onPress,
  buttonText,
  isDesktop,
}: ResumenPedidoProps) {
  return (
    <View
      // Si es desktop, tiene un ancho máximo; si es mobile, es w-full
      className={`bg-card border border-border px-6 pt-5 pb-8 shadow-lg ${
        isDesktop ? "rounded-3xl w-80" : "rounded-t-3xl w-full"
      }`}
    >
      <ThemedText className="text-lg font-bold text-foreground mb-4">
        Resumen del pedido
      </ThemedText>

      <View className="flex-row justify-between mb-2">
        <ThemedText className="text-muted-foreground">Subtotal</ThemedText>
        <ThemedText className="text-foreground font-medium">
          Bs. {subtotal.toFixed(2)}
        </ThemedText>
      </View>

      <View className="h-px bg-border my-3" />

      <View className="flex-row justify-between mb-5">
        <ThemedText className="text-foreground font-bold text-lg">
          Total
        </ThemedText>
        <ThemedText className="text-foreground font-bold text-xl">
          Bs. {subtotal.toFixed(2)}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
        className="bg-foreground rounded-2xl py-4 items-center active:scale-95"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-background font-bold text-base">
            {buttonText}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
