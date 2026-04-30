/* eslint-disable react/display-name */
// screens/catalogo/CatalogoDetailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  View,
  useWindowDimensions
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useCartStore } from "../../store/cartStore";
import { Shimmer } from "./components/Shimmer";
import { useCatalogoDetail } from "./hooks/useCatalogoDetail";
import { FotoCatalogo } from "./types/catalogo.types";

// ─── Constantes ──────────────────────────────────────────────────────────────
const MAX_CONTENT_WIDTH = 768;

// ─── Dot del carrusel ────────────────────────────────────────────────────────
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
        { height: 6, borderRadius: 9999, backgroundColor: "#FFFFFF" },
      ]}
    />
  );
});

// ─── Carousel item ─────────────────────────────────────────────────────────
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
        contentFit="contain"
        transition={180}
        placeholder="LGF5?xYk^6#M@-5c,1J5@[or[Q6."
      />
    </View>
  ),
);

// ─── Botón volver ─────────────────────────────────────────────────────────
function BackButton({
  onPress,
  topInset,
}: {
  onPress: () => void;
  topInset: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        top: topInset + 12,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.85)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      }}
      accessibilityLabel="Volver"
    >
      <Ionicons name="chevron-back" size={22} color="#1E1B4B" />
    </Pressable>
  );
}

// ─── Galería de imágenes ─────────────────────────────────────────────────
interface ImageGalleryProps {
  fotos: FotoCatalogo[];
  onBack: () => void;
  containerWidth: number;
  topInset: number;
}

function ImageGallery({
  fotos,
  onBack,
  containerWidth,
  topInset,
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const hasMultiple = fotos.length > 1;
  const carouselHeight = Math.min(containerWidth * 0.75, 500);

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
        <ThemedText className="text-muted-foreground text-sm mt-2">
          Sin imágenes
        </ThemedText>
        <BackButton onPress={onBack} topInset={topInset} />
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
        autoPlayInterval={1800}
        scrollAnimationDuration={400}
        data={fotos}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <CarouselItem
            item={item}
            width={containerWidth}
            height={carouselHeight}
          />
        )}
      />
      <BackButton onPress={onBack} topInset={topInset} />
      {hasMultiple && (
        <View
          style={{
            position: "absolute",
            top: topInset + 12,
            right: 16,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 9999,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <ThemedText
            style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}
          >
            {activeIndex + 1} / {fotos.length}
          </ThemedText>
        </View>
      )}
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
            <CarouselDot key={i} index={i} activeIndex={activeIndex} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Pantalla principal ─────────────────────────────────────────────────
export default function CatalogoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const idProducto = Number(id);
  const { width } = useWindowDimensions();
  const containerWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const insets = useSafeAreaInsets();
  const topInset = insets.top;

  const { producto, loading, error } = useCatalogoDetail(idProducto);
  const addToCart = useCartStore((state) => state.addToCart);

  const cartBtnScale = useSharedValue(1);
  const cartBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBtnScale.value }],
  }));

  const handleAddToCart = useCallback(() => {
    if (!producto) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    cartBtnScale.value = withSpring(0.94, { damping: 12 }, () => {
      cartBtnScale.value = withSpring(1);
    });
    addToCart(producto as any);
    Toast.show({
      type: "success",
      text1: "Añadido al carrito",
      text2: `${producto.nombre} agregado correctamente.`,
      visibilityTime: 2500,
    });
    router.back();
  }, [producto, addToCart, cartBtnScale, router]);

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          paddingTop: topInset,
        }}
      >
        <View style={{ width: "100%", maxWidth: MAX_CONTENT_WIDTH }}>
          {/* Skeleton de la imagen */}
          <Shimmer width="100%" height={300} borderRadius={0} />

          <View style={{ padding: 20 }}>
            {/* Categoría */}
            <Shimmer width={100} height={20} borderRadius={12} />
            <View style={{ height: 8 }} />

            {/* Nombre */}
            <Shimmer width="70%" height={28} borderRadius={8} />
            <View style={{ height: 8 }} />

            {/* Descripción */}
            <Shimmer width="100%" height={16} borderRadius={8} />
            <View style={{ height: 4 }} />
            <Shimmer width="80%" height={16} borderRadius={8} />
            <View style={{ height: 16 }} />

            {/* Precio */}
            <Shimmer width={120} height={36} borderRadius={8} />

            {/* Separador */}
            <View
              style={{
                height: 24,
                borderBottomWidth: 0.5,
                borderColor: "#E5E7EB",
              }}
            />

            {/* Título detalles */}
            <Shimmer width={150} height={20} borderRadius={8} />
            <View style={{ height: 12 }} />

            {/* Renglones de detalles */}
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Shimmer width={40} height={40} borderRadius={12} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Shimmer width="60%" height={14} borderRadius={6} />
                  <View style={{ height: 4 }} />
                  <Shimmer width="80%" height={12} borderRadius={6} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Skeleton del botón flotante */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom + 10,
            paddingHorizontal: 20,
            paddingTop: 10,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderTopWidth: 0.5,
            borderTopColor: "#E5E7EB",
            alignItems: "center",
          }}
        >
          <Shimmer width="100%" height={56} borderRadius={16} />
        </View>
      </View>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (error || !producto) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          paddingTop: topInset,
        }}
      >
        <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
        <ThemedText className="text-status-error font-bold text-lg text-center mt-4">
          {error ?? "Producto no encontrado"}
        </ThemedText>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-8 py-3 rounded-xl mt-6 active:scale-95"
        >
          <ThemedText className="text-white font-semibold">Volver</ThemedText>
        </Pressable>
      </Animated.View>
    );
  }

  const tieneDescuento = producto.precioDescuento != null;
  const precioMostrar = tieneDescuento
    ? producto.precioDescuento!
    : producto.precio;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 100 + insets.bottom,
        }}
      >
        {/* ── Galería de imágenes ── */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <ImageGallery
            fotos={producto.fotos}
            onBack={() => router.back()}
            containerWidth={containerWidth}
            topInset={topInset}
          />
        </Animated.View>

        {/* ── Contenido ── */}
        <View
          style={{
            width: "100%",
            maxWidth: MAX_CONTENT_WIDTH,
            paddingHorizontal: 20,
          }}
        >
          {/* Información principal */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            {producto.categoria && (
              <View className="mt-6 mb-3 self-start">
                <ThemedText className="bg-secondary px-4 py-1.5 rounded-full text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                  {producto.categoria.nombre}
                </ThemedText>
              </View>
            )}

            <ThemedText className="text-2xl font-extrabold text-foreground leading-tight">
              {producto.nombre}
            </ThemedText>

            {producto.descripcion && (
              <ThemedText className="text-base text-muted-foreground mt-3 leading-relaxed">
                {producto.descripcion}
              </ThemedText>
            )}

            {/* Precio */}
            <View className="flex-row items-end mt-5">
              <ThemedText className="text-4xl font-black text-primary">
                Bs {precioMostrar}
              </ThemedText>
              {tieneDescuento && (
                <>
                  <ThemedText className="text-lg text-muted-foreground line-through ml-3 mb-1">
                    Bs {producto.precio}
                  </ThemedText>
                  <View className="bg-secondary px-2 py-0.5 rounded-full ml-2 mb-1">
                    <ThemedText className="text-xs font-bold text-secondary-foreground">
                      -
                      {Math.round(
                        ((producto.precio - producto.precioDescuento!) /
                          producto.precio) *
                          100,
                      )}
                      %
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
          </Animated.View>

          {/* Separador */}
          <View className="h-px bg-border my-6" />

          {/* Detalles */}
          <Animated.View entering={FadeInUp.duration(400).delay(350)}>
            <ThemedText className="text-lg font-bold text-foreground mb-4">
              Detalles del producto
            </ThemedText>
            {(
              [
                {
                  icon: "checkmark-circle-outline",
                  label: "Disponibilidad",
                  value: "En stock · entrega inmediata",
                },
                {
                  icon: "shield-checkmark-outline",
                  label: "Garantía",
                  value: "Producto garantizado",
                },
                {
                  icon: "help-circle-outline",
                  label: "Soporte",
                  value: "Soporte técnico al realizar su compra",
                },
              ] as const
            ).map(({ icon, label, value }) => (
              <View
                key={label}
                className="flex-row items-center bg-muted/50 rounded-xl p-4 mb-3"
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name={icon} size={20} color="#7C3AED" />
                </View>
                <View className="ml-4">
                  <ThemedText className="text-foreground font-semibold text-sm">
                    {label}
                  </ThemedText>
                  <ThemedText className="text-muted-foreground text-xs mt-0.5">
                    {value}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* ── Botón flotante ── */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(500)}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 10,
          paddingHorizontal: 20,
          paddingTop: 10,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderTopWidth: 0.5,
          borderTopColor: "#E5E7EB",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={[cartBtnStyle, { width: "100%", maxWidth: MAX_CONTENT_WIDTH }]}
        >
          <Pressable
            onPress={handleAddToCart}
            className="bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-soft active:scale-95"
          >
            <Ionicons name="cart-outline" size={22} color="white" />
            <ThemedText className="text-white font-bold text-lg">
              Añadir al carrito
            </ThemedText>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
