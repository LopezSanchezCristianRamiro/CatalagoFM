// screens/carrito/CarritoScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../contexts/AuthContext";
import { httpClient } from "../../http/httpClient";
import { useCartStore } from "../../store/cartStore";
import { CarritoItem } from "./components/CarritoItem";
import { CarritoVacio } from "./components/CarritoVacio";
import { ResumenPedido } from "./components/ResumenPedido";
import { useQrPago } from "./hooks/useQrPago";

export default function CarritoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeFromCart, updateCantidad, clearCart, getTotal } =
    useCartStore();
  const subtotal = Number(getTotal());
  const { width: windowWidth } = useWindowDimensions();

  const isDesktop = Platform.OS === "web" && windowWidth >= 1024;
  const contentWidth = isDesktop ? 1200 : windowWidth;

  // PASOS: 1 (Carrito), 2 (Selección Método / Login), 3 (Detalle QR/Entrega)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<
    "contra_entrega" | "qr" | null
  >(null);

  // ANIMACIÓN DE SLIDE (3 pasos)
  const slideAnim = useSharedValue(0);
  useEffect(() => {
    slideAnim.value = withSpring(-(step - 1) * contentWidth, {
      damping: 22,
      stiffness: 150,
    });
  }, [step, contentWidth]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  // Callback cuando el pago QR se confirma (polling o manual)
  const onQrConfirmado = useCallback(async () => {
    await ejecutarCrearPedido("qr");
  }, [items]);

  const { estadoQr, qrData, isVerifying, generarQr, verificarPago, resetQr } =
    useQrPago(onQrConfirmado);

  // Crear pedido en backend
  const ejecutarCrearPedido = useCallback(
    async (tipoPago: string) => {
      setLoading(true);
      try {
        await httpClient.postAuth("/api/pedidos", {
          tipoPago,
          items: items.map((i) => ({
            idProducto: i.idProducto,
            cantidad: i.cantidad,
            precioUnitario: Number(i.precioDescuento ?? i.precio),
          })),
        });
        clearCart();
        resetAllStates();
        router.replace("/(tabs)/perfil");
        Alert.alert("¡Éxito!", "Pedido realizado con éxito.");
      } catch (e: any) {
        Alert.alert("Error", e.message || "Error al procesar pedido");
      } finally {
        setLoading(false);
      }
    },
    [items, clearCart, router],
  );

  const resetAllStates = () => {
    setStep(1);
    setSelectedPayment(null);
    setLoading(false);
    resetQr();
  };

  // ---------- POLLING AUTOMÁTICO DEL QR ----------
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
    const activo =
      step === 3 &&
      selectedPayment === "qr" &&
      (estadoQr === "esperando" || estadoQr === "verificando");

    if (!activo) {
      detenerPolling();
      return;
    }

    if (pollingRef.current) return;

    const ejecutarPolling = async () => {
      intentosRef.current += 1;

      if (intentosRef.current > MAX_INTENTOS) {
        detenerPolling();
        resetQr();
        setSelectedPayment(null);
        setStep(2);
        return;
      }

      await verificarPago(true);

      const sigueActivo =
        step === 3 &&
        selectedPayment === "qr" &&
        (estadoQr === "esperando" || estadoQr === "verificando");

      if (sigueActivo) {
        pollingRef.current = setTimeout(ejecutarPolling, 1000);
      }
    };

    pollingRef.current = setTimeout(ejecutarPolling, 1000);

    return detenerPolling;
  }, [step, selectedPayment, estadoQr, verificarPago, resetQr]);

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      detenerPolling();
      resetQr();
    };
  }, []);

  // Al salir del paso 3, reseteamos intentos y QR
  useEffect(() => {
    if (step !== 3) {
      intentosRef.current = 0;
      detenerPolling();
    }
  }, [step]);

  // -------------------------------------------------

  // --- VISTA PASO 1: CARRITO ---
  const renderPaso1 = () => (
    <View style={{ width: contentWidth }} className="flex-1 flex-row">
      <ScrollView
        className="flex-1 p-4 lg:p-10"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText className="text-4xl font-black mb-8">Tu Carrito</ThemedText>
        {items.map((item) => (
          <CarritoItem
            key={item.idProducto}
            item={item}
            onIncrementar={() =>
              updateCantidad(item.idProducto, item.cantidad + 1)
            }
            onDecrementar={() =>
              updateCantidad(item.idProducto, item.cantidad - 1)
            }
            onEliminar={() => removeFromCart(item.idProducto)}
          />
        ))}
      </ScrollView>
      {isDesktop && (
        <View className="p-10 pt-24">
          <ResumenPedido
            subtotal={subtotal}
            loading={false}
            buttonText="Continuar al pago"
            onPress={() => setStep(2)}
            isDesktop
          />
        </View>
      )}
    </View>
  );

  // --- VISTA PASO 2: LOGIN / SELECCIÓN DE MÉTODO ---
  const renderPaso2 = () => (
    <View
      style={{ width: contentWidth }}
      className="flex-1 items-center justify-center px-6"
    >
      <View className="w-full max-w-2xl">
        <Pressable
          onPress={() => setStep(1)}
          className="flex-row items-center mb-10 self-start"
        >
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
          <ThemedText className="ml-2 text-primary font-bold">
            Volver al carrito
          </ThemedText>
        </Pressable>

        {!user ? (
          // USUARIO NO LOGUEADO
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
          // USUARIO LOGUEADO: SELECCIÓN DE MÉTODO
          <>
            <ThemedText className="text-3xl font-black mb-2 text-center">
              Método de pago
            </ThemedText>
            <ThemedText className="text-muted-foreground mb-12 text-center text-lg">
              ¿Cómo deseas pagar?
            </ThemedText>
            <View className="flex-row justify-center gap-6">
              <TarjetaPagoCuadrada
                icon="cash-outline"
                titulo="Contra Entrega"
                onPress={() => {
                  setSelectedPayment("contra_entrega");
                  setStep(3);
                }}
              />
              <TarjetaPagoCuadrada
                icon="qr-code-outline"
                titulo="Pago con QR"
                onPress={() => {
                  setSelectedPayment("qr");
                  generarQr(subtotal, "Pago de pedido");
                  intentosRef.current = 0; // reiniciar contador de intentos
                  setStep(3);
                }}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );

  // --- VISTA PASO 3: CONFIRMACIÓN / QR ---
  const renderPaso3 = () => (
    <View
      style={{ width: contentWidth }}
      className="flex-1 items-center justify-center px-6"
    >
      <View className="w-full max-w-lg items-center">
        <Pressable
          onPress={() => {
            setStep(2);
            resetQr();
            setSelectedPayment(null);
          }}
          className="flex-row items-center mb-8 self-start bg-secondary/20 px-4 py-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={20} color="#7C3AED" />
          <ThemedText className="ml-2 text-primary font-bold">
            Cambiar método
          </ThemedText>
        </Pressable>

        <View className="w-full bg-card p-10 rounded-[40px] border border-border shadow-2xl items-center">
          {selectedPayment === "contra_entrega" ? (
            // PAGO CONTRA ENTREGA
            <View className="items-center w-full">
              <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                <Ionicons name="bicycle-outline" size={48} color="#7C3AED" />
              </View>
              <ThemedText className="text-2xl font-bold mb-2">
                Verificar Pedido
              </ThemedText>
              <ThemedText className="text-muted-foreground text-center mb-10 text-base">
                Pagarás un total de Bs. {subtotal.toFixed(2)} al recibir tus
                productos en casa.
              </ThemedText>
              <Pressable
                onPress={() => ejecutarCrearPedido("contra_entrega")}
                disabled={loading}
                className="bg-primary w-full py-5 rounded-2xl items-center shadow-lg active:scale-95"
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
            // PAGO CON QR
            <View className="items-center w-full">
              <ThemedText className="text-2xl font-bold mb-1">
                Pago con QR
              </ThemedText>
              <ThemedText className="text-muted-foreground mb-8">
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
                      onPress={() => generarQr(subtotal, "Pago de pedido")}
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
                    onPress={() => verificarPago(false)} // manual, muestra loading
                    disabled={isVerifying}
                    className="mt-8 bg-primary w-full py-5 rounded-2xl items-center shadow-md active:scale-95"
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

  if (items.length === 0) return <CarritoVacio />;

  return (
    <View className="flex-1 bg-background items-center">
      <View style={{ width: contentWidth }} className="flex-1 overflow-hidden">
        <Animated.View
          style={[
            { width: contentWidth * 3, flex: 1, flexDirection: "row" },
            animatedContainerStyle,
          ]}
        >
          {/* PASO 1 */}
          {renderPaso1()}

          {/* PASO 2 */}
          {renderPaso2()}

          {/* PASO 3 */}
          {renderPaso3()}
        </Animated.View>
      </View>

      {/* Footer móvil solo en paso 1 */}
      {!isDesktop && step === 1 && (
        <ResumenPedido
          subtotal={subtotal}
          loading={false}
          buttonText="Continuar al pago"
          onPress={() => setStep(2)}
        />
      )}
    </View>
  );
}

// Tarjeta cuadrada reutilizable
function TarjetaPagoCuadrada({
  icon,
  titulo,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-card border border-border rounded-[32px] w-[180px] h-[180px] items-center justify-center shadow-sm active:bg-secondary/10 active:scale-95"
    >
      <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
        <Ionicons name={icon} size={34} color="#7C3AED" />
      </View>
      <ThemedText className="font-bold text-lg text-center px-2">
        {titulo}
      </ThemedText>
    </Pressable>
  );
}
