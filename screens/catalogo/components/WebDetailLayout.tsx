/* eslint-disable react/display-name */
// screens/catalogo/components/WebDetailLayout.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { useCartStore } from "../../../store/cartStore";
import type { FotoCatalogo, ProductoCatalogo } from "../types/catalogo.types";

interface Props {
  producto: ProductoCatalogo;
  insets: { top: number; bottom: number };
}

// ─── Dot del carrusel ────────────────────────────────────────────────────────
const CarouselDot = React.memo(
  ({ index, activeIndex, onPress }: { index: number; activeIndex: number; onPress: () => void }) => {
    const isActive = index === activeIndex;
    const animStyle = useAnimatedStyle(() => ({
      width: withSpring(isActive ? 24 : 6, { damping: 14, stiffness: 180 }),
      opacity: withSpring(isActive ? 1 : 0.35, { damping: 14, stiffness: 180 }),
    }));
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        <Animated.View
          style={[
            animStyle,
            { height: 6, borderRadius: 9999, backgroundColor: "#FFFFFF" },
          ]}
        />
      </Pressable>
    );
  }
);

// ─── Thumbnail del carrusel ───────────────────────────────────────────────────
const Thumbnail = React.memo(
  ({
    item,
    isActive,
    onPress,
  }: {
    item: FotoCatalogo;
    isActive: boolean;
    onPress: () => void;
  }) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(isActive ? 1 : scale.value) }],
      borderWidth: isActive ? 2 : 1,
      borderColor: isActive ? "#7C3AED" : "rgba(229,231,235,0.6)",
      opacity: isActive ? 1 : 0.6,
    }));
    return (
      <Pressable
        onPress={onPress}
        // @ts-ignore
        onMouseEnter={() => { if (!isActive) scale.value = withSpring(0.92); }}
        onMouseLeave={() => { scale.value = withSpring(1); }}
      >
        <Animated.View
          style={[
            animStyle,
            {
              width: 60,
              height: 60,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#F3F4F6",
            },
          ]}
        >
          <Image
            source={{ uri: item.urlFoto ?? undefined }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </Animated.View>
      </Pressable>
    );
  }
);

// ─── Imagen del carrusel ──────────────────────────────────────────────────────
const CarouselImage = React.memo(
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9FAFB",
      }}
    >
      <Image
        source={{ uri: item.urlFoto ?? undefined }}
        style={{ width: "85%", height: "85%" }}
        contentFit="contain"
        transition={400}
      />
    </View>
  )
);

// ─── Badge de descuento ───────────────────────────────────────────────────────
const DiscountBadge = React.memo(({ pct }: { pct: number }) => (
  <Animated.View
    entering={FadeIn.duration(400).delay(600)}
    style={{
      position: "absolute",
      top: 16,
      right: 16,
      backgroundColor: "#7C3AED",
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
      // @ts-ignore
      boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
      zIndex: 10,
    }}
  >
    <ThemedText style={{ color: "#FFF", fontWeight: "900", fontSize: 14 }}>
      -{pct}%
    </ThemedText>
  </Animated.View>
));

// ─── Pill de detalle ──────────────────────────────────────────────────────────
const DetailPill = React.memo(
  ({
    icon,
    label,
    value,
    delay,
  }: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
    delay: number;
  }) => {
    const hover = useSharedValue(0);
    const animStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: withSpring(hover.value * -2) }],
      // @ts-ignore
      boxShadow: `0 ${4 + hover.value * 6}px ${12 + hover.value * 8}px rgba(0,0,0,${0.05 + hover.value * 0.04})`,
      backgroundColor: `rgba(255,255,255,${0.7 + hover.value * 0.3})`,
    }));
    return (
      <Animated.View
        entering={FadeInUp.duration(350).delay(delay).springify()}
        style={animStyle}
        // @ts-ignore
        onMouseEnter={() => { hover.value = withSpring(1); }}
        onMouseLeave={() => { hover.value = withSpring(0); }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: "rgba(229,231,235,0.5)",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "rgba(124,58,237,0.08)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Ionicons name={icon} size={18} color="#7C3AED" />
          </View>
          <View>
            <ThemedText style={{ fontSize: 11, fontWeight: "700", color: "#374151", letterSpacing: 0.3 }}>
              {label}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>
              {value}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  }
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function WebDetailLayout({ producto, insets }: Props) {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const addToCart = useCartStore((state) => state.addToCart);

  const maxWidth = 1100;
  const containerWidth = Math.min(windowWidth - 48, maxWidth);
  const galleryWidth = containerWidth * 0.52;
  const totalHeight = windowHeight - insets.top - insets.bottom - 32;
  const mainGalleryHeight = totalHeight * 0.72;

  const fotos =
    producto.fotos.length > 0
      ? producto.fotos
      : [
          {
            idFotoProducto: 0,
            urlFoto: null,
            idProducto: producto.idProducto,
          } as FotoCatalogo,
        ];
  const hasMultiple = fotos.length > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const goTo = useCallback(
    (i: number) => {
      carouselRef.current?.scrollTo({ index: i, animated: true });
      setActiveIndex(i);
    },
    []
  );

  // Animaciones botón principal
  const buttonHover = useSharedValue(0);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(1 + buttonHover.value * 0.025) },
      { translateY: withSpring(buttonHover.value * -2) },
    ],
    backgroundColor: interpolateColor(
      buttonHover.value,
      [0, 1],
      ["#7C3AED", "#6D28D9"]
    ),
    // @ts-ignore
    boxShadow: `0 ${8 + buttonHover.value * 8}px ${20 + buttonHover.value * 12}px rgba(124,58,237,${0.28 + buttonHover.value * 0.15})`,
  }));

  // Animaciones imagen galería
  const galleryHover = useSharedValue(0);
  const galleryAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 + galleryHover.value * 0.015) }],
  }));

  const handleAddToCart = useCallback(() => {
    if (producto.estado === "desactivado") {
      Toast.show({
        type: "error",
        text1: "Producto no disponible",
        text2: "Este producto no puede añadirse al carrito.",
      });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart(producto as any);
    Toast.show({
      type: "success",
      text1: "¡Añadido al carrito!",
      text2: `${producto.nombre} agregado correctamente.`,
      visibilityTime: 2500,
    });
    router.back();
  }, [producto, addToCart, router]);

  const tieneDescuento = producto.precioDescuento != null;
  const precioMostrar = tieneDescuento
    ? producto.precioDescuento!
    : producto.precio;
  const pctDescuento = tieneDescuento
    ? Math.round(
        ((producto.precio - producto.precioDescuento!) / producto.precio) * 100
      )
    : 0;

  const details = [
    {
      icon: "checkmark-circle-outline" as const,
      label: "Disponibilidad",
      value: "En stock · entrega inmediata",
    },
    {
      icon: "shield-checkmark-outline" as const,
      label: "Garantía",
      value: "Producto garantizado",
    },
    {
      icon: "help-circle-outline" as const,
      label: "Soporte",
      value: "Soporte técnico al comprar",
    },
  ];

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={{
        flex: 1,
        backgroundColor: "#FAFAFE",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
      }}
    >
      {/* Botón atrás flotante */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={{ position: "absolute", top: insets.top + 12, left: 24, zIndex: 99 }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "rgba(255,255,255,0.95)",
            alignItems: "center",
            justifyContent: "center",
            // @ts-ignore
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Ionicons name="chevron-back" size={22} color="#1E1B4B" />
        </Pressable>
      </Animated.View>

      {/* Layout principal */}
      <View
        style={{
          width: containerWidth,
          flexDirection: "row",
          height: totalHeight,
          gap: 24,
          alignItems: "stretch",
        }}
      >
        {/* ── COLUMNA IZQUIERDA: galería ── */}
        <Animated.View
          entering={FadeInLeft.duration(500).springify()}
          style={{ width: galleryWidth, flexDirection: "column", gap: 12 }}
        >
          {/* Imagen principal */}
          <View
            style={{
              height: mainGalleryHeight,
              borderRadius: 28,
              overflow: "hidden",
              position: "relative",
              backgroundColor: "#F3F4F6",
              // @ts-ignore
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
            // @ts-ignore
            onMouseEnter={() => { galleryHover.value = withSpring(1); }}
            onMouseLeave={() => { galleryHover.value = withSpring(0); }}
          >
            {producto.fotos.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#EDE9FE",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="image-outline" size={64} color="#C4B5FD" />
                <ThemedText style={{ color: "#6B7280", marginTop: 12 }}>
                  Sin imágenes
                </ThemedText>
              </View>
            ) : (
              <Animated.View style={[galleryAnimStyle, { flex: 1 }]}>
                <Carousel
                  ref={carouselRef}
                  loop={hasMultiple}
                  width={galleryWidth}
                  height={mainGalleryHeight}
                  autoPlay={hasMultiple}
                  autoPlayInterval={4500}
                  scrollAnimationDuration={600}
                  data={fotos}
                  onSnapToItem={setActiveIndex}
                  renderItem={({ item }) => (
                    <CarouselImage
                      item={item}
                      width={galleryWidth}
                      height={mainGalleryHeight}
                    />
                  )}
                />
              </Animated.View>
            )}

            {/* Gradiente inferior */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.22)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                pointerEvents: "none",
              }}
            />

            {/* Dots del carrusel */}
            {hasMultiple && (
              <View
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 0,
                  right: 0,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {fotos.map((_, i) => (
                  <CarouselDot
                    key={i}
                    index={i}
                    activeIndex={activeIndex}
                    onPress={() => goTo(i)}
                  />
                ))}
              </View>
            )}

            {/* Badge de descuento sobre la imagen */}
            {tieneDescuento && <DiscountBadge pct={pctDescuento} />}

            {/* Categoría chip */}
            {producto.categoria && (
              <Animated.View
                entering={FadeIn.duration(400).delay(300)}
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  backgroundColor: "rgba(255,255,255,0.92)",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  // @ts-ignore
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: "#7C3AED",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  {producto.categoria.nombre}
                </ThemedText>
              </Animated.View>
            )}
          </View>

          {/* Thumbnails */}
          {hasMultiple && (
            <Animated.View
              entering={FadeInUp.duration(400).delay(400)}
              style={{ flexDirection: "row", gap: 10, paddingHorizontal: 4 }}
            >
              {fotos.slice(0, 6).map((foto, i) => (
                <Thumbnail
                  key={foto.idFotoProducto}
                  item={foto}
                  isActive={i === activeIndex}
                  onPress={() => goTo(i)}
                />
              ))}
            </Animated.View>
          )}
        </Animated.View>

        {/* ── COLUMNA DERECHA: información ── */}
        <Animated.View
          entering={FadeInRight.duration(500).springify().delay(150)}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.78)",
              // @ts-ignore
              backdropFilter: "blur(16px)",
              borderRadius: 28,
              borderWidth: 1,
              borderColor: "rgba(229,231,235,0.55)",
              // @ts-ignore
              boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 28, paddingBottom: 0 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Nombre del producto */}
              <Animated.View entering={FadeInUp.duration(350).delay(250)}>
                <ThemedText
                  style={{
                    fontSize: 30,
                    fontWeight: "900",
                    color: "#1E1B4B",
                    lineHeight: 36,
                    letterSpacing: -0.5,
                  }}
                  numberOfLines={3}
                >
                  {producto.nombre}
                </ThemedText>
              </Animated.View>

              {/* Separador decorativo */}
              <Animated.View
                entering={FadeInUp.duration(350).delay(320)}
                style={{
                  height: 3,
                  width: 48,
                  backgroundColor: "#7C3AED",
                  borderRadius: 4,
                  marginTop: 14,
                  marginBottom: 16,
                }}
              />

              {/* Descripción */}
              {producto.descripcion && (
                <Animated.View entering={FadeInUp.duration(350).delay(380)}>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      lineHeight: 22,
                      marginBottom: 20,
                    }}
                  >
                    {producto.descripcion}
                  </ThemedText>
                </Animated.View>
              )}

              {/* Precio */}
              <Animated.View
                entering={FadeInUp.duration(350).delay(440)}
                style={{
                  backgroundColor: "rgba(124,58,237,0.05)",
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: "rgba(124,58,237,0.12)",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#9CA3AF",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Precio
                </ThemedText>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                  <ThemedText
                    style={{
                      fontSize: 42,
                      fontWeight: "900",
                      color: "#7C3AED",
                      lineHeight: 46,
                      letterSpacing: -1,
                    }}
                  >
                    Bs {precioMostrar}
                  </ThemedText>
                  {tieneDescuento && (
                    <ThemedText
                      style={{
                        fontSize: 18,
                        color: "#D1D5DB",
                        textDecorationLine: "line-through",
                        marginBottom: 4,
                        fontWeight: "600",
                      }}
                    >
                      Bs {producto.precio}
                    </ThemedText>
                  )}
                </View>
                {tieneDescuento && (
                  <ThemedText
                    style={{ fontSize: 12, color: "#7C3AED", fontWeight: "700", marginTop: 4 }}
                  >
                    Ahorras Bs {(producto.precio - producto.precioDescuento!).toFixed(2)} · {pctDescuento}% de descuento
                  </ThemedText>
                )}
              </Animated.View>

              {/* Detalles en grid 3 pills */}
              <Animated.View
                entering={FadeInUp.duration(350).delay(500)}
                style={{ marginBottom: 24 }}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#374151",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Incluye
                </ThemedText>
                <View style={{ gap: 8 }}>
                  {details.map(({ icon, label, value }, i) => (
                    <DetailPill
                      key={label}
                      icon={icon}
                      label={label}
                      value={value}
                      delay={540 + i * 60}
                    />
                  ))}
                </View>
              </Animated.View>
            </ScrollView>

            {/* CTA fijo al fondo */}
            <Animated.View
              entering={FadeInUp.duration(400).delay(700)}
              style={{
                padding: 20,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: "rgba(229,231,235,0.4)",
                backgroundColor: "rgba(255,255,255,0.5)",
                // @ts-ignore
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Info stock */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor:
                      producto.estado === "desactivado" ? "#EF4444" : "#10B981",
                  }}
                />
                <ThemedText
                  style={{ fontSize: 12, color: "#6B7280", fontWeight: "600" }}
                >
                  {producto.estado === "desactivado"
                    ? "No disponible actualmente"
                    : "En stock · listo para entrega"}
                </ThemedText>
              </View>

              {/* Botón principal */}
              <Pressable
                onPress={handleAddToCart}
                disabled={producto.estado === "desactivado"}
                // @ts-ignore
                onMouseEnter={() => { if (producto.estado !== "desactivado") buttonHover.value = withSpring(1); }}
                onMouseLeave={() => { buttonHover.value = withSpring(0); }}
              >
                <Animated.View
                  style={[
                    buttonAnimatedStyle,
                    {
                      borderRadius: 18,
                      paddingVertical: 17,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10,
                      opacity: producto.estado === "desactivado" ? 0.5 : 1,
                    },
                  ]}
                >
                  <Ionicons name="cart-outline" size={22} color="white" />
                  <ThemedText
                    style={{
                      color: "white",
                      fontWeight: "800",
                      fontSize: 16,
                      letterSpacing: 0.3,
                    }}
                  >
                    Añadir al carrito
                  </ThemedText>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}