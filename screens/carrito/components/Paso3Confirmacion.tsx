// screens/carrito/components/Paso3Confirmacion.tsx
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

interface Paso3ConfirmacionProps {
  contentWidth: number;
  selectedPayment: "contra_entrega" | "qr" | null;
  subtotal: number;
  estadoQr: string;
  qrData: any;
  isVerifying: boolean;
  loading: boolean;
  onVolver: () => void;
  onConfirmarContraEntrega: () => void;
  onVerificarPago: () => void;
  onRegenerarQr: () => void;
}

export function Paso3Confirmacion({
  contentWidth,
  selectedPayment,
  subtotal,
  estadoQr,
  qrData,
  isVerifying,
  loading,
  onVolver,
  onConfirmarContraEntrega,
  onVerificarPago,
  onRegenerarQr,
}: Paso3ConfirmacionProps) {
  return (
    <View
      style={{ width: contentWidth, height: "100%" }}
      className="items-center justify-center px-6"
    >
      <View className="w-full max-w-lg items-center">
        <Pressable
          onPress={onVolver}
          className="self-start mb-6 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={20} color="#7C3AED" />
          <ThemedText className="ml-2 text-primary font-bold">
            Volver
          </ThemedText>
        </Pressable>

        <View className="w-full bg-card p-6 rounded-[40px] border border-border items-center">
          {selectedPayment === "contra_entrega" ? (
            <View className="items-center w-full">
              <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                <Ionicons name="bicycle-outline" size={48} color="#7C3AED" />
              </View>
              <ThemedText className="text-xl font-bold mt-4">
                Verificar Pedido
              </ThemedText>
              <ThemedText className="text-muted-foreground text-center text-base mt-2">
                Pagarás un total de Bs. {subtotal.toFixed(2)} al recibir tus
                productos en casa.
              </ThemedText>
              <ThemedText className="text-center font-bold my-4 text-lg">
                Total: Bs. {subtotal.toFixed(2)}
              </ThemedText>
              <Pressable
                className="bg-primary w-full py-4 rounded-xl items-center shadow-lg active:scale-95 mt-2"
                onPress={onConfirmarContraEntrega}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText className="text-white font-bold text-lg">
                    CONFIRMAR PEDIDO
                  </ThemedText>
                )}
              </Pressable>
            </View>
          ) : (
            <View className="items-center w-full">
              <ThemedText className="text-2xl font-bold mb-1">
                Pago con QR
              </ThemedText>
              <ThemedText className="text-muted-foreground mb-6 font-bold">
                Total: Bs. {subtotal.toFixed(2)}
              </ThemedText>

              <View className="w-64 h-64 bg-white p-4 rounded-3xl items-center justify-center border-2 border-primary/10 shadow-inner">
                {estadoQr === "generando" ? (
                  <ActivityIndicator size="large" color="#7C3AED" />
                ) : qrData &&
                  (estadoQr === "esperando" || estadoQr === "verificando") ? (
                  <Image
                    source={{ uri: `data:image/png;base64,${qrData.qrImage}` }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                ) : estadoQr === "error" ? (
                  <View className="items-center">
                    <Ionicons name="alert-circle" size={48} color="#EF4444" />
                    <ThemedText className="text-red-500 text-sm mt-2">
                      Error al generar QR
                    </ThemedText>
                    <Pressable
                      onPress={onRegenerarQr}
                      className="mt-4 px-4 py-2 bg-primary rounded-xl"
                    >
                      <ThemedText className="text-white font-bold text-xs">
                        REINTENTAR
                      </ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <ActivityIndicator size="large" color="#7C3AED" />
                )}
              </View>

              <ThemedText className="mt-8 font-bold text-primary text-xl tracking-tight">
                {estadoQr === "esperando"
                  ? "Esperando pago..."
                  : estadoQr === "verificando"
                    ? "Verificando..."
                    : estadoQr === "confirmado"
                      ? "¡Pago confirmado!"
                      : ""}
              </ThemedText>

              {qrData &&
                estadoQr !== "generando" &&
                estadoQr !== "confirmado" && (
                  <Pressable
                    onPress={onVerificarPago}
                    disabled={isVerifying}
                    className="mt-6 bg-primary w-full py-4 rounded-2xl items-center shadow-md active:scale-95"
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <ThemedText className="text-white font-bold text-lg">
                        VERIFICAR PAGO
                      </ThemedText>
                    )}
                  </Pressable>
                )}

              {estadoQr === "confirmado" && (
                <ThemedText className="text-status-success text-sm mt-4">
                  Redirigiendo...
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
