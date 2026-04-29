import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

interface ResumenPedidoProps {
  subtotal: number;
  loading: boolean;
  onConfirmar: () => void;
  web?: boolean;
}

export function ResumenPedido({ subtotal, loading, onConfirmar, web }: ResumenPedidoProps) {
  return (
    <View className={`bg-card border border-border px-6 pt-5 pb-8 shadow-lg ${
      web ? "rounded-3xl" : "rounded-t-3xl"  
    }`}>
      <ThemedText className="text-lg font-bold text-foreground mb-4">
        Resumen del pedido
      </ThemedText>

      <View className="flex-row justify-between mb-2">
        <ThemedText className="text-muted-foreground">Subtotal</ThemedText>
        <ThemedText className="text-foreground font-medium">
          ${subtotal.toFixed(2)}
        </ThemedText>
      </View>

      <View className="h-px bg-border my-3" />

      <View className="flex-row justify-between mb-5">
        <ThemedText className="text-foreground font-bold text-lg">Total</ThemedText>
        <ThemedText className="text-foreground font-bold text-xl">
          ${subtotal.toFixed(2)}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={onConfirmar}
        disabled={loading}
        className="bg-foreground rounded-2xl py-4 items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-background font-bold text-base">
            Confirmar Pedido
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}