// screens/catalogo/components/MobileDetailLayout.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { useCartStore } from "../../../store/cartStore";
import type { FotoCatalogo, ProductoCatalogo } from "../types/catalogo.types";

const MAX_CONTENT_WIDTH = 768;

/* ─────── Componentes locales (galería) ─────── */

interface CarouselDotProps { index: number; activeIndex: number; }
const CarouselDot = React.memo(({ index, activeIndex }: CarouselDotProps) => {
  const isActive = index === activeIndex;
  const animStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 20 : 6, { damping: 14, stiffness: 180 }),
    opacity: withSpring(isActive ? 1 : 0.4, { damping: 14, stiffness: 180 }),
  }));
  return <Animated.View style={[animStyle, { height: 6, borderRadius: 9999, backgroundColor: "#FFFFFF" }]} />;
});

interface CarouselItemProps { item: FotoCatalogo; width: number; height: number; index: number; onFirstImageLoad?: (ratio: number) => void; }
const CarouselItem = React.memo(({ item, width, height, index, onFirstImageLoad }: CarouselItemProps) => (
  <View style={{ width, height, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}>
    <Image
      source={{ uri: item.urlFoto ?? undefined }}
      style={{ width: "100%", height: "100%" }}
      contentFit="contain"
      transition={180}
      placeholder="LGF5?xYk^6#M@-5c,1J5@[or[Q6."
      onLoad={(e) => {
        if (index === 0 && onFirstImageLoad && e.source.width && e.source.height) {
          onFirstImageLoad(e.source.width / e.source.height);
        }
      }}
    />
  </View>
));

function BackButton({ onPress, topInset }: { onPress: () => void; topInset: number }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute", top: topInset + 12, left: 16,
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.85)",
        alignItems: "center", justifyContent: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
      }}
      accessibilityLabel="Volver"
    >
      <Ionicons name="chevron-back" size={22} color="#1E1B4B" />
    </Pressable>
  );
}

interface ImageGalleryProps {
  fotos: FotoCatalogo[];
  onBack: () => void;
  containerWidth: number;
  topInset: number;
}

function ImageGallery({ fotos, onBack, containerWidth, topInset }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const [fixedRatio, setFixedRatio] = useState<number>(1.2);
  const calculatedHeight = containerWidth / fixedRatio;
  const carouselHeight = Math.min(Math.max(calculatedHeight, 300), 550);
  const hasMultiple = fotos.length > 1;

  if (fotos.length === 0) {
    return (
      <View style={{ width: containerWidth, height: containerWidth, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="image-outline" size={56} color="#C4B5FD" />
        <ThemedText className="text-muted-foreground text-sm mt-2">Sin imágenes</ThemedText>
        <BackButton onPress={onBack} topInset={topInset} />
      </View>
    );
  }

  return (
    <View style={{ width: containerWidth, height: carouselHeight, overflow: "hidden", backgroundColor: "#F9FAFB" }}>
      <Carousel
        ref={carouselRef}
        loop={hasMultiple}
        width={containerWidth}
        height={carouselHeight}
        autoPlay={hasMultiple}
        autoPlayInterval={3000}
        scrollAnimationDuration={400}
        data={fotos}
        onSnapToItem={setActiveIndex}
        renderItem={({ item, index }) => (
          <CarouselItem
            item={item}
            width={containerWidth}
            height={carouselHeight}
            index={0}
            onFirstImageLoad={(ratio) => setFixedRatio(ratio)}
          />
        )}
      />
      <BackButton onPress={onBack} topInset={topInset} />
      {hasMultiple && (
        <View style={{ position: "absolute", top: topInset + 12, right: 16, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 }}>
          <ThemedText style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>{activeIndex + 1} / {fotos.length}</ThemedText>
        </View>
      )}
      {hasMultiple && (
        <View style={{ position: "absolute", bottom: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }}>
          {fotos.map((_, i) => <CarouselDot key={i} index={i} activeIndex={activeIndex} />)}
        </View>
      )}
    </View>
  );
}

/* ─────── Layout Mobile ─────── */

interface Props {
  producto: ProductoCatalogo;
  insets: { top: number; bottom: number };
}

export function MobileDetailLayout({ producto, insets }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const containerWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const addToCart = useCartStore((state) => state.addToCart);

  const cartBtnScale = useSharedValue(1);
  const cartBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: cartBtnScale.value }] }));

  const handleAddToCart = useCallback(() => {
    if (producto.estado === "desactivado") {
      Toast.show({ type: "error", text1: "Producto no disponible", text2: "Este producto no puede añadirse al carrito." });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    cartBtnScale.value = withSpring(0.94, { damping: 12 }, () => { cartBtnScale.value = withSpring(1); });
    addToCart(producto as any);
    Toast.show({ type: "success", text1: "Añadido al carrito", text2: `${producto.nombre} agregado correctamente.`, visibilityTime: 2500 });
    router.back();
  }, [producto, addToCart, cartBtnScale, router]);

  const tieneDescuento = producto.precioDescuento != null;
  const precioMostrar = tieneDescuento ? producto.precioDescuento! : producto.precio;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", paddingBottom: 100 + insets.bottom }}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <ImageGallery
            fotos={producto.fotos}
            onBack={() => router.back()}
            containerWidth={containerWidth}
            topInset={insets.top}
          />
        </Animated.View>

        <View style={{ width: "100%", maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: 20 }}>
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            {producto.categoria && (
              <View className="mt-6 mb-3 self-start">
                <ThemedText className="bg-secondary px-4 py-1.5 rounded-full text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                  {producto.categoria.nombre}
                </ThemedText>
              </View>
            )}
            <ThemedText className="text-2xl font-extrabold text-foreground leading-tight">{producto.nombre}</ThemedText>
            {producto.descripcion && (
              <ThemedText className="text-base text-muted-foreground mt-3 leading-relaxed">{producto.descripcion}</ThemedText>
            )}
            <View className="flex-row items-end mt-5">
              <ThemedText className="text-4xl font-black text-primary">Bs {precioMostrar}</ThemedText>
              {tieneDescuento && (
                <>
                  <ThemedText className="text-lg text-muted-foreground line-through ml-3 mb-1">Bs {producto.precio}</ThemedText>
                  <View className="bg-secondary px-2 py-0.5 rounded-full ml-2 mb-1">
                    <ThemedText className="text-xs font-bold text-secondary-foreground">
                      -{Math.round(((producto.precio - producto.precioDescuento!) / producto.precio) * 100)}%
                    </ThemedText>
                  </View>
                </>
              )}
            </View>
          </Animated.View>

          <View className="h-px bg-border my-6" />

          <Animated.View entering={FadeInUp.duration(400).delay(350)}>
            <ThemedText className="text-lg font-bold text-foreground mb-4">Detalles del producto</ThemedText>
            {(
              [
                { icon: "checkmark-circle-outline", label: "Disponibilidad", value: "En stock · entrega inmediata" },
                { icon: "shield-checkmark-outline", label: "Garantía", value: "Producto garantizado" },
                { icon: "help-circle-outline", label: "Soporte", value: "Soporte técnico al realizar su compra" },
              ] as const
            ).map(({ icon, label, value }) => (
              <View key={label} className="flex-row items-center bg-muted/50 rounded-xl p-4 mb-3">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name={icon} size={20} color="#7C3AED" />
                </View>
                <View className="ml-4">
                  <ThemedText className="text-foreground font-semibold text-sm">{label}</ThemedText>
                  <ThemedText className="text-muted-foreground text-xs mt-0.5">{value}</ThemedText>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.duration(400).delay(500)}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: insets.bottom + 10, paddingHorizontal: 20, paddingTop: 10, backgroundColor: "rgba(255,255,255,0.95)", borderTopWidth: 0.5, borderTopColor: "#E5E7EB", alignItems: "center" }}
      >
        <Animated.View style={[cartBtnStyle, { width: "100%", maxWidth: MAX_CONTENT_WIDTH }]}>
          <Pressable onPress={handleAddToCart} className="bg-primary py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-soft active:scale-95">
            <Ionicons name="cart-outline" size={22} color="white" />
            <ThemedText className="text-white font-bold text-lg">Añadir al carrito</ThemedText>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}