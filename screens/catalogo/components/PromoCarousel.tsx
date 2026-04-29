import { LinearGradient } from "expo-linear-gradient"; // Asegúrate de tenerlo instalado
import React, { useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { ThemedText } from "../../../components/ThemedText";
import { ProductoCatalogo } from "../types/catalogo.types";

interface PromoCarouselProps {
  promociones: ProductoCatalogo[];
  onPressPromo: (producto: ProductoCatalogo) => void;
}

// ... (mismos imports)

const CAROUSEL_HEIGHT_MOBILE = 520;
const CAROUSEL_HEIGHT_DESKTOP = 500; // Reducido de 650 para que no sea tan invasivo

export function PromoCarousel({
  promociones,
  onPressPromo,
}: PromoCarouselProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && containerWidth >= 1024;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  };

  if (!promociones || promociones.length === 0) return null;

  const carouselHeight = isDesktop
    ? CAROUSEL_HEIGHT_DESKTOP
    : CAROUSEL_HEIGHT_MOBILE;

  // El ancho del item sigue siendo el 82%, pero ahora lo centraremos
  const itemWidth = isDesktop ? containerWidth * 0.82 : containerWidth;

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      {containerWidth > 0 && (
        <View
          style={{
            width: containerWidth,
            height: carouselHeight,
            alignItems: "center", // CRÍTICO: Centra el carrusel horizontalmente
            justifyContent: "center",
          }}
        >
          <Carousel
            loop={promociones.length > 1}
            autoPlay={promociones.length > 1}
            autoPlayInterval={4500}
            scrollAnimationDuration={1000}
            data={promociones}
            width={itemWidth} // El ancho de la "celda" es el del item
            height={carouselHeight}
            style={{
              width: containerWidth, // El área táctil/visual total
              height: carouselHeight,
              justifyContent: "center",
            }}
            mode={isDesktop ? "parallax" : undefined}
            modeConfig={
              isDesktop
                ? {
                    parallaxScrollingScale: 0.97,
                    parallaxScrollingOffset: 200, // Ajustado para que no se desplace tanto
                    parallaxAdjacentItemScale: 0.9,
                  }
                : undefined
            }
            renderItem={({ item }) => (
              <PromoSlide
                item={item}
                onPress={onPressPromo}
                height={carouselHeight}
                isDesktop={isDesktop}
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

interface PromoSlideProps {
  item: ProductoCatalogo;
  onPress: (p: ProductoCatalogo) => void;
  height: number;
  isDesktop: boolean;
}

function PromoSlide({ item, onPress, height, isDesktop }: PromoSlideProps) {
  const imageUrl =
    item.fotos && item.fotos.length > 0 ? item.fotos[0].urlFoto : null;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onPress(item)}
      // En desktop le damos un poco de redondeo para que el parallax luzca más
      style={{
        height,
        width: "100%",
        borderRadius: isDesktop ? 32 : 0,
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            backgroundColor: "#020617",
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ position: "absolute", height: "100%", width: "100%" }}
          className="bg-zinc-900 items-center justify-center"
        />
      )}

      {/* GRADIENTE SUAVE CON EXPO-LINEAR-GRADIENT */}
      <LinearGradient
        // Comienza transparente y termina en un negro profundo
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.95)"]}
        locations={[0.3, 0.6, 0.9]} // Controla dónde empieza a oscurecerse
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "100%", // Cubre todo para un efecto cinematográfico
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: isDesktop ? 48 : 24, // Más espacio en desktop
          paddingBottom: isDesktop ? 60 : 40,
        }}
      >
        <View
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
          className="rounded-full bg-primary/90 px-4 py-2"
        >
          <ThemedText className="text-xs font-bold uppercase tracking-widest text-primary-foreground">
            Sugerencia para ti
          </ThemedText>
        </View>

        <ThemedText
          className={`font-black text-white tracking-tighter ${
            isDesktop ? "text-6xl mb-4" : "text-4xl mb-2"
          }`}
          numberOfLines={2}
        >
          {item.nombre}
        </ThemedText>

        {item.descripcion && (
          <ThemedText
            className={`text-gray-300 font-medium ${
              isDesktop ? "text-xl max-w-2xl" : "text-lg"
            }`}
            numberOfLines={isDesktop ? 3 : 2}
          >
            {item.descripcion}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}
