/* eslint-disable react/display-name */
// app/(catalogo)/CatalogoDetailScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useCartStore } from "../../store/cartStore";
import { useCatalogoDetail } from "./hooks/useCatalogoDetail";
import { FotoCatalogo } from "./types/catalogo.types";

// ─── Constantes ──────────────────────────────────────────────────────────────
const MAX_CONTENT_WIDTH = 768; // Ancho máximo para pantallas grandes (desktop/tablets)

// ─── CarouselDot ─────────────────────────────────────────────────────────────
interface CarouselDotProps {
  index: number;
  activeIndex: number;
}

const CarouselDot = React.memo(({ index, activeIndex }: CarouselDotProps) => {
  const isActive = index === activeIndex;
  const animStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 20 : 6, { damping: 14, stiffness: 180 }),
    opacity: withSpring(isActive ? 1 : 0.4, { damping: 14, stiffness: 180 }),
  }));
  return (
    <Animated.View
      style={[
        animStyle,
        { height: 6, borderRadius: 9999, backgroundColor: "#000" }, // Cambiado a negro/oscuro para visibilidad sin el gradiente falso
      ]}
    />
  );
});

// ─── CarouselItem ─────────────────────────────────────────────────────────────
const CarouselItem = React.memo(
  ({
    item,
    width,
    height,
  }: {
    item: FotoCatalogo;
    width: number;
    height: number;
  }) => (
    <View
      style={{
        width,
        height,
        backgroundColor: "#F9FAFB",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={{ uri: item.urlFoto ?? undefined }}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain" // CRÍTICO: 'contain' evita que logos/imágenes se corten en web
        transition={180}
        placeholder="LGF5?xYk^6#M@-5c,1J5@[or[Q6."
      />
    </View>
  ),
);

// ─── BackButton ───────────────────────────────────────────────────────────────
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        position: "absolute",
        top: 14,
        left: 14,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.9)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
      }}
      accessibilityLabel="Volver"
      accessibilityRole="button"
    >
      <Ionicons name="chevron-back" size={20} color="#1E1B4B" />
    </TouchableOpacity>
  );
}

// ─── DiscountBadge ────────────────────────────────────────────────────────────
function DiscountBadge({
  original,
  discounted,
}: {
  original: number;
  discounted: number;
}) {
  const pct = Math.round(((original - discounted) / original) * 100);
  return (
    <View
      style={{
        backgroundColor: "#F5F3FF",
        borderRadius: 9999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: "center",
        marginLeft: 8,
      }}
    >
      <ThemedText style={{ fontSize: 12, fontWeight: "700", color: "#4C1D95" }}>
        –{pct}%
      </ThemedText>
    </View>
  );
}

// ─── ImageGallery ─────────────────────────────────────────────────────────────
interface ImageGalleryProps {
  fotos: FotoCatalogo[];
  onBack: () => void;
  containerWidth: number;
}

function ImageGallery({ fotos, onBack, containerWidth }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const hasMultiple = fotos.length > 1;

  // Calculamos una altura razonable (máximo 450px para no ocupar toda la pantalla en desktop)
  const carouselHeight = Math.min(containerWidth * 0.72, 450);

  if (fotos.length === 0) {
    return (
      <View
        style={{
          width: containerWidth,
          height: carouselHeight,
          backgroundColor: "#EDE9FE",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="image-outline" size={56} color="#C4B5FD" />
        <ThemedText style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
          Sin imágenes
        </ThemedText>
        <BackButton onPress={onBack} />
      </View>
    );
  }

  return (
    <View
      style={{
        width: containerWidth,
        height: carouselHeight,
        overflow: "hidden",
        backgroundColor: "#F9FAFB",
      }}
    >
      <Carousel
        ref={carouselRef}
        loop={hasMultiple}
        width={containerWidth}
        height={carouselHeight}
        autoPlay={hasMultiple}
        autoPlayInterval={1500}
        data={fotos}
        scrollAnimationDuration={500}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <CarouselItem
            item={item}
            width={containerWidth}
            height={carouselHeight}
          />
        )}
      />

      <BackButton onPress={onBack} />

      {hasMultiple && (
        <View
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: 9999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <ThemedText
            style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}
          >
            {activeIndex + 1} / {fotos.length}
          </ThemedText>
        </View>
      )}

      {hasMultiple && (
        <View
          style={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            paddingVertical: 4,
            backgroundColor: "rgba(255,255,255,0.4)", // Fondo sutil para que los dots se vean sobre cualquier imagen
            alignSelf: "center",
            borderRadius: 20,
            paddingHorizontal: 10,
          }}
        >
          {fotos.map((_, i) => (
            <CarouselDot key={i} index={i} activeIndex={activeIndex} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function CatalogoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const idProducto = Number(id);

  // CRÍTICO: useWindowDimensions reacciona a cambios de tamaño de ventana en Web
  const { width } = useWindowDimensions();
  const containerWidth = Math.min(width, MAX_CONTENT_WIDTH);

  const { producto, loading, error } = useCatalogoDetail(idProducto);
  const addToCart = useCartStore((state) => state.addToCart);

  const cartBtnScale = useSharedValue(1);
  const cartBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBtnScale.value }],
  }));

  const handleAddToCart = useCallback(() => {
    if (!producto) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    cartBtnScale.value = withSpring(0.96, { damping: 10 }, () => {
      cartBtnScale.value = withSpring(1);
    });
    addToCart(producto as any);
    Toast.show({
      type: "success",
      text1: "Añadido al carrito",
      text2: `${producto.nombre} ha sido agregado.`,
    });
    router.back();
  }, [producto, addToCart, cartBtnScale]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#7C3AED" />
        <ThemedText className="text-muted-foreground text-sm mt-3">
          Cargando producto...
        </ThemedText>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !producto) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-1 bg-background items-center justify-center p-6"
      >
        <Ionicons name="alert-circle-outline" size={52} color="#EF4444" />
        <ThemedText className="text-status-error font-bold text-lg text-center mt-4">
          {error ?? "Producto no encontrado"}
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-7 py-3 rounded-lg mt-6"
          activeOpacity={0.85}
        >
          <ThemedText className="text-white font-semibold">Volver</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const tieneDescuento = producto.precioDescuento != null;
  const precioMostrar = tieneDescuento
    ? producto.precioDescuento!
    : producto.precio;

  return (
    // Contenedor principal: ocupa toda la pantalla pero su contenido estará centrado
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center", // Centra el contenedor interior en web
          paddingBottom: 110,
        }}
      >
        {/* Contenedor tipo "tarjeta" que limita el ancho en pantallas grandes */}
        <View
          style={{
            width: "100%",
            maxWidth: MAX_CONTENT_WIDTH,
            backgroundColor: "#FFFFFF",
            minHeight: "100%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          {/* ── Carrusel de imágenes ── */}
          <Animated.View entering={FadeInDown.duration(350)}>
            <ImageGallery
              fotos={producto.fotos}
              onBack={() => router.back()}
              containerWidth={containerWidth}
            />
          </Animated.View>

          {/* ── Info principal ── */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(150)}
            style={{ paddingHorizontal: 20, paddingTop: 20 }}
          >
            {producto.categoria && (
              <View style={{ marginBottom: 10, alignSelf: "flex-start" }}>
                <ThemedText
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: "#4C1D95",
                    backgroundColor: "#F5F3FF",
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 9999,
                    overflow: "hidden",
                  }}
                >
                  {producto.categoria.nombre}
                </ThemedText>
              </View>
            )}

            <ThemedText
              style={{
                fontSize: 24, // Un poco más grande para desktop
                fontWeight: "800",
                color: "#1E1B4B",
                lineHeight: 30,
              }}
            >
              {producto.nombre}
            </ThemedText>

            {producto.descripcion && (
              <ThemedText
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginTop: 8,
                  lineHeight: 22,
                }}
              >
                {producto.descripcion}
              </ThemedText>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                marginTop: 16,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 32, // Resaltamos más el precio
                  fontWeight: "900",
                  color: "#7C3AED",
                  lineHeight: 36,
                }}
              >
                Bs {precioMostrar}
              </ThemedText>
              {tieneDescuento && (
                <>
                  <ThemedText
                    style={{
                      fontSize: 16,
                      color: "#9CA3AF",
                      textDecorationLine: "line-through",
                      marginLeft: 10,
                      marginBottom: 4,
                    }}
                  >
                    Bs {producto.precio}
                  </ThemedText>
                  <DiscountBadge
                    original={producto.precio}
                    discounted={producto.precioDescuento!}
                  />
                </>
              )}
            </View>
          </Animated.View>

          {/* ── Separador ── */}
          <View
            style={{
              height: 1,
              backgroundColor: "#E5E7EB",
              marginHorizontal: 20,
              marginVertical: 24,
            }}
          />

          {/* ── Sección de detalles ── */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(300)}
            style={{ paddingHorizontal: 20, paddingBottom: 40 }}
          >
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#1E1B4B",
                marginBottom: 16,
              }}
            >
              Detalles del producto
            </ThemedText>

            {(
              [
                {
                  icon: "cube-outline" as const,
                  label: "Disponibilidad",
                  value: "En stock · entrega inmediata",
                },
                {
                  icon: "shield-checkmark-outline" as const,
                  label: "Garantía",
                  value: "Producto garantizado",
                },
                {
                  icon: "headset-outline" as const,
                  label: "Soporte",
                  value: "Soporte técnico al realizar su compra",
                },
              ] as const
            ).map(({ icon, label, value }, idx, arr) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  borderBottomWidth: idx < arr.length - 1 ? 0.5 : 0,
                  borderBottomColor: "#E5E7EB",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "#F5F3FF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={icon} size={20} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1E1B4B",
                    }}
                  >
                    {label}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      marginTop: 2,
                    }}
                  >
                    {value}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* ── CTA flotante adaptado a desktop ── */}
      <Animated.View
        entering={FadeInUp.duration(350).delay(500)}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center", // Centra el contenedor interno
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: MAX_CONTENT_WIDTH,
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Animated.View style={cartBtnStyle}>
            <TouchableOpacity
              onPress={handleAddToCart}
              activeOpacity={0.9}
              style={{
                backgroundColor: "#7C3AED",
                paddingVertical: 16,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                shadowColor: "#7C3AED",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
              accessibilityLabel="Añadir al carrito"
              accessibilityRole="button"
            >
              <Ionicons name="cart-outline" size={22} color="white" />
              <ThemedText
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Añadir al carrito
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}
