// screens/carrito/components/Paso2Pago.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { TarjetaPagoCuadrada } from "./TarjetaPagoCuadrada";

interface Paso2PagoProps {
  contentWidth: number;
  user: any | null;
  subtotal: number;
  onVolver: () => void;
  onSeleccionContraEntrega: () => void;
  onSeleccionQr: () => void;
}

export function Paso2Pago({
  contentWidth,
  user,
  subtotal,
  onVolver,
  onSeleccionContraEntrega,
  onSeleccionQr,
}: Paso2PagoProps) {
  const router = useRouter();

  return (
    <View
      style={{ width: contentWidth, height: "100%" }}
      className="items-center justify-center px-6"
    >
      <View className="w-full max-w-2xl items-center">
        <Pressable
          onPress={onVolver}
          className="flex-row items-center mb-10 self-start"
        >
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
          <ThemedText className="ml-2 text-primary font-bold">
            Volver
          </ThemedText>
        </Pressable>

        {!user ? (
          <View className="items-center">
            <Ionicons name="person-circle-outline" size={72} color="#8B5CF6" />
            <ThemedText className="text-2xl font-bold mt-4 mb-2 text-center">
              Inicia sesión o regístrate
            </ThemedText>
            <ThemedText className="text-muted-foreground text-sm text-center mb-8">
              Necesitas una cuenta para finalizar tu pedido.
            </ThemedText>
            <Pressable
              onPress={() => router.push("/login")}
              className="bg-primary rounded-xl py-4 w-72 items-center mb-3 active:scale-95"
            >
              <ThemedText className="text-primary-foreground font-bold text-base">
                Iniciar sesión
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/register")}
              className="bg-secondary rounded-xl py-4 w-72 items-center border border-border active:scale-95"
            >
              <ThemedText className="text-secondary-foreground font-bold text-base">
                Registrarse
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <>
            <ThemedText className="text-3xl font-black mb-2 text-center">
              Pago
            </ThemedText>
            <ThemedText className="text-muted-foreground mb-12 text-center">
              ¿Cómo deseas pagar?
            </ThemedText>
            <View className="flex-row justify-center flex-wrap gap-4">
              <TarjetaPagoCuadrada
                icon="cash-outline"
                titulo="Contra Entrega"
                onPress={onSeleccionContraEntrega}
              />
              <TarjetaPagoCuadrada
                icon="qr-code-outline"
                titulo="QR"
                onPress={onSeleccionQr}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
