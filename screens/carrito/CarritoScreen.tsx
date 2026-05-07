// screens/carrito/CarritoScreen.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { httpClient } from "../../http/httpClient";
import { useCartStore } from "../../store/cartStore";
import { CarritoVacio } from "./components/CarritoVacio";
import { Paso1Carrito } from "./components/Paso1Carrito";
import { Paso2Pago } from "./components/Paso2Pago";
import { Paso3Confirmacion } from "./components/Paso3Confirmacion";
import { ResumenPedido } from "./components/ResumenPedido";
import { useQrPago } from "./hooks/useQrPago";

export default function CarritoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeFromCart, updateCantidad, clearCart, getTotal } =
    useCartStore();
  const subtotal = Number(getTotal());
  const { width: windowWidth } = useWindowDimensions();

  const [containerWidth, setContainerWidth] = useState(windowWidth);

  const isDesktop = Platform.OS === "web" && windowWidth >= 1024;
  const contentWidth = isDesktop ? 1200 : containerWidth;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<
    "contra_entrega" | "qr" | null
  >(null);

  const slideAnim = useSharedValue(0);
  useEffect(() => {
    slideAnim.value = withSpring(-(step - 1) * contentWidth, {
      damping: 25,
      stiffness: 150,
    });
  }, [step, contentWidth]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const onQrConfirmado = useCallback(async () => {
    await ejecutarCrearPedido("qr", "pagado");
  }, [items]);

  const { estadoQr, qrData, isVerifying, generarQr, verificarPago, resetQr } =
    useQrPago(onQrConfirmado);

  const ejecutarCrearPedido = useCallback(
    async (tipoPago: string, estado?: string) => {
      setLoading(true);
      try {
        await httpClient.postAuth("/api/pedidos", {
          tipoPago,
          estado: estado ?? undefined,
          items: items.map((i) => ({
            idProducto: i.idProducto,
            cantidad: i.cantidad,
            precioUnitario: Number(i.precioDescuento ?? i.precio),
          })),
        });
        clearCart();
        resetAllStates();
        router.replace("/(tabs)/perfil");
        Toast.show({
          type: "success",
          text1: "Pedido realizado",
          text2: `Espera a que te contactemos por medio de tu teléfono celular`,
        });
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

  useEffect(() => {
    return () => {
      detenerPolling();
      resetQr();
    };
  }, []);

  useEffect(() => {
    if (step !== 3) {
      intentosRef.current = 0;
      detenerPolling();
    }
  }, [step]);

  useEffect(() => {
    if (estadoQr === "confirmado" && user && qrData) {
      const payload = {
        telefono: user.telefono,
        cliente: user.nombres,
        qrId: qrData.qrId,
        total: subtotal,
        items: items.map((item) => ({
          nombre: item.nombre,
          precio: Number(item.precioDescuento ?? item.precio),
          cantidad: item.cantidad,
        })),
      };
      console.log("JSON para pago QR:", JSON.stringify(payload, null, 2));
    }
  }, [estadoQr, user, qrData, subtotal, items]);

  if (items.length === 0) return <CarritoVacio />;

  return (
    <View
      className="flex-1 bg-background items-center w-full"
      onLayout={(e) => {
        const layoutWidth = e.nativeEvent.layout.width;
        if (layoutWidth > 0) {
          setContainerWidth(layoutWidth);
        }
      }}
    >
      <View style={{ width: contentWidth }} className="flex-1 overflow-hidden">
        <Animated.View
          style={[
            {
              width: contentWidth * 3,
              flex: 1,
              flexDirection: "row",
              alignItems: "stretch",
            },
            animatedContainerStyle,
          ]}
        >
          <Paso1Carrito
            contentWidth={contentWidth}
            isDesktop={isDesktop}
            items={items}
            subtotal={subtotal}
            onIncrementar={(id) =>
              updateCantidad(
                id,
                (items.find((i) => i.idProducto === id)?.cantidad ?? 0) + 1,
              )
            }
            onDecrementar={(id) =>
              updateCantidad(
                id,
                Math.max(
                  (items.find((i) => i.idProducto === id)?.cantidad ?? 0) - 1,
                  1,
                ),
              )
            }
            onEliminar={removeFromCart}
            onUpdateCantidad={updateCantidad}
            onContinuar={() => setStep(2)}
          />
          <Paso2Pago
            contentWidth={contentWidth}
            user={user}
            subtotal={subtotal}
            onVolver={() => setStep(1)}
            onSeleccionContraEntrega={() => {
              setSelectedPayment("contra_entrega");
              setStep(3);
            }}
            onSeleccionQr={() => {
              setSelectedPayment("qr");
              generarQr(subtotal, "Pago");
              setStep(3);
            }}
          />
          <Paso3Confirmacion
            contentWidth={contentWidth}
            selectedPayment={selectedPayment}
            subtotal={subtotal}
            estadoQr={estadoQr}
            qrData={qrData}
            isVerifying={isVerifying}
            loading={loading}
            onVolver={() => {
              setStep(2);
              resetQr();
            }}
            onConfirmarContraEntrega={() =>
              ejecutarCrearPedido("contra_entrega")
            }
            onVerificarPago={() => verificarPago(false)}
            onRegenerarQr={() => generarQr(subtotal, "Pago de pedido")}
          />
        </Animated.View>
      </View>

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
