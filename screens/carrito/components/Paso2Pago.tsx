import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { ThemedText } from "../../../components/ThemedText";
import { PagoQrSection } from "./PagoQrSection";
import { TarjetaPago } from "./TarjetaPago";

interface Paso2PagoProps {
  user: any;
  subtotal: number;
  loading: boolean;
  selectedPayment: "contra_entrega" | "qr" | null;
  onSeleccionarMetodo: (tipo: "contra_entrega" | "qr") => void;
  onQrConfirmado: () => Promise<void>;
  onVolver: () => void;
}

export function Paso2Pago({
  user,
  subtotal,
  loading,
  selectedPayment,
  onSeleccionarMetodo,
  onQrConfirmado,
  onVolver,
}: Paso2PagoProps) {
  const router = useRouter();

  // Si no hay usuario logueado
  if (!user) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Animated.View
          entering={FadeInRight}
          className="w-full max-w-xs items-center"
        >
          <Ionicons name="person-circle-outline" size={72} color="#8B5CF6" />
          <ThemedText className="text-foreground font-bold text-xl mt-4 mb-2 text-center">
            Inicia sesión o regístrate
          </ThemedText>
          <ThemedText className="text-muted-foreground text-sm text-center mb-8">
            Necesitas una cuenta para finalizar tu pedido.
          </ThemedText>
          <Pressable
            onPress={() => router.push("/login")}
            className="bg-primary rounded-xl py-4 w-full items-center mb-3 active:scale-95"
          >
            <ThemedText className="text-primary-foreground font-bold text-base">
              Iniciar sesión
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push("/register")}
            className="bg-secondary rounded-xl py-4 w-full items-center border border-border active:scale-95"
          >
            <ThemedText className="text-secondary-foreground font-bold text-base">
              Registrarse
            </ThemedText>
          </Pressable>
          <Pressable onPress={onVolver} className="mt-6">
            <ThemedText className="text-accent text-sm font-medium">
              ← Volver al carrito
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  // Si ya eligió QR, mostramos la interfaz del QR
  if (selectedPayment === "qr") {
    return (
      <PagoQrSection
        subtotal={subtotal}
        onPagoConfirmado={onQrConfirmado}
        onVolver={onVolver}
      />
    );
  }

  // Si está logueado pero no ha elegido método de pago
  return (
    <View className="flex-1 bg-background justify-center p-6">
      <Animated.View entering={FadeInRight} className="w-full">
        <ThemedText className="text-2xl font-bold text-foreground mb-2 text-center">
          Método de pago
        </ThemedText>
        <ThemedText className="text-muted-foreground text-sm mb-8 text-center">
          Elige cómo deseas pagar tu pedido de Bs. {subtotal.toFixed(2)}
        </ThemedText>

        <View className="gap-4">
          <TarjetaPago
            icon="cash-outline"
            titulo="Contra Entrega"
            descripcion="Pagas en efectivo cuando recibas tu pedido."
            onPress={() => onSeleccionarMetodo("contra_entrega")}
          />
          <TarjetaPago
            icon="qr-code-outline"
            titulo="Pago con QR"
            descripcion="Escanea y paga al instante con tu billetera digital."
            onPress={() => onSeleccionarMetodo("qr")}
          />
        </View>

        <Pressable onPress={onVolver} className="mt-8 items-center">
          <ThemedText className="text-accent text-sm font-medium">
            ← Volver al carrito
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}
