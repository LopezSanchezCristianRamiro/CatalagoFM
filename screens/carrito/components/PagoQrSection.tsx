import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { ThemedText } from "../../../components/ThemedText";
import { useQrPago } from "../hooks/useQrPago";

interface PagoQrSectionProps {
  subtotal: number;
  onPagoConfirmado: () => Promise<void>;
  onVolver: () => void;
}

export function PagoQrSection({
  subtotal,
  onPagoConfirmado,
  onVolver,
}: PagoQrSectionProps) {
  const {
    estadoQr,
    qrData,
    errorMsg,
    isVerifying,
    generarQr,
    verificarPago,
    resetQr,
  } = useQrPago(onPagoConfirmado);

  // Efecto para generar el QR al montar
  useEffect(() => {
    generarQr(subtotal, "Pago de pedido");
    return () => resetQr();
  }, []);

  // Polling automático
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentosRef = useRef(0);
  const MAX_INTENTOS = 120;

  const detenerPolling = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    if (estadoQr === "esperando" || estadoQr === "verificando") {
      intentosRef.current += 1;
      if (intentosRef.current > MAX_INTENTOS) {
        resetQr();
        return;
      }
      pollingRef.current = setTimeout(async () => {
        await verificarPago();
      }, 1000);
    } else {
      detenerPolling();
    }
    return detenerPolling;
  }, [estadoQr, verificarPago, resetQr]);

  return (
    <View className="flex-1 bg-background justify-center items-center p-6">
      <Animated.View
        entering={FadeInRight}
        exiting={FadeOutLeft}
        className="w-full max-w-sm items-center"
      >
        <ThemedText className="text-2xl font-bold text-foreground mb-2">
          Escanea el QR
        </ThemedText>
        <ThemedText className="text-muted-foreground text-sm mb-6 text-center">
          Usa tu app bancaria para pagar Bs. {subtotal.toFixed(2)}
        </ThemedText>

        {/* Área del QR */}
        <View className="w-56 h-56 bg-card border border-border rounded-2xl items-center justify-center overflow-hidden mb-4">
          {qrData?.qrImage &&
          (estadoQr === "esperando" || estadoQr === "verificando") ? (
            <Image
              source={{ uri: `data:image/png;base64,${qrData.qrImage}` }}
              className="w-52 h-52"
              resizeMode="contain"
            />
          ) : estadoQr === "generando" ? (
            <ActivityIndicator size="large" color="#8B5CF6" />
          ) : estadoQr === "error" ? (
            <>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <ThemedText className="text-status-error text-xs mt-2 text-center px-2">
                {errorMsg || "Error al generar QR"}
              </ThemedText>
              <Pressable
                onPress={() => generarQr(subtotal, "Pago de pedido")}
                className="mt-3 px-4 py-2 bg-primary rounded-xl active:scale-95"
              >
                <ThemedText className="text-white font-bold text-xs">
                  REINTENTAR
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator size="large" color="#8B5CF6" />
          )}
        </View>

        {/* Estado */}
        <ThemedText className="text-foreground font-semibold text-lg mt-2 text-center">
          {estadoQr === "esperando"
            ? "Esperando pago..."
            : estadoQr === "verificando"
              ? "Verificando pago..."
              : estadoQr === "confirmado"
                ? "¡Pago confirmado!"
                : estadoQr === "error"
                  ? "Error al generar QR"
                  : "Generando código QR..."}
        </ThemedText>

        {estadoQr === "confirmado" && (
          <ThemedText className="text-status-success text-sm mt-2">
            Redirigiendo...
          </ThemedText>
        )}

        {/* Botón verificar manual */}
        {qrData &&
          estadoQr !== "generando" &&
          estadoQr !== "idle" &&
          estadoQr !== "error" && (
            <Pressable
              onPress={verificarPago}
              disabled={isVerifying}
              className="mt-6 py-3 px-8 bg-foreground rounded-xl active:scale-95"
            >
              <ThemedText className="text-background font-bold text-sm">
                Verificar ahora
              </ThemedText>
            </Pressable>
          )}

        {/* Volver */}
        <Pressable onPress={onVolver} className="mt-6">
          <ThemedText className="text-accent text-sm font-medium">
            ← Volver al carrito
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}
