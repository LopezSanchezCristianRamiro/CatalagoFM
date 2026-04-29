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

const CAROUSEL_HEIGHT_MOBILE = 192;
const CAROUSEL_HEIGHT_DESKTOP = 260;

export function PromoCarousel({
  promociones,
  onPressPromo,
}: PromoCarouselProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && containerWidth >= 768;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  };

  if (!promociones || promociones.length === 0) return null;

  const carouselHeight = isDesktop
    ? CAROUSEL_HEIGHT_DESKTOP
    : CAROUSEL_HEIGHT_MOBILE;

  // itemWidth = ancho de cada slide
  // En desktop ~58% del contenedor → los adyacentes se asoman ~21% a cada lado
  const itemWidth = isDesktop
    ? Math.min(Math.round(containerWidth * 0.58), 760)
    : Math.round(containerWidth * 0.85);

  // offsetX para centrar: el carrusel arranca desde 0 (izquierda),
  // necesitamos desplazarlo (containerWidth - itemWidth) / 2 hacia la derecha
  const offsetX = (containerWidth - itemWidth) / 2;

  return (
    <View
      onLayout={onLayout}
      style={{ marginBottom: 24, width: "100%", overflow: "visible" }}
    >
      {containerWidth > 0 && (
        <View
          style={{
            // Este View tiene el ancho exacto del contenedor medido
            width: containerWidth,
            height: carouselHeight,
            overflow: "visible",
          }}
        >
          <Carousel
            loop={promociones.length > 1}
            autoPlay={promociones.length > 1}
            autoPlayInterval={isDesktop ? 2300 : 2300}
            scrollAnimationDuration={isDesktop ? 1500 : 1500}
            data={promociones}
            // ✅ width = ancho de CADA item (el store lo necesita)
            width={itemWidth}
            height={carouselHeight}
            style={{
              // ✅ El contenedor visual = itemWidth (no containerWidth)
              // Lo centramos manualmente con marginLeft
              width: itemWidth,
              height: carouselHeight,
              marginLeft: offsetX, // centra el carrusel dentro del contenedor
              overflow: "visible",
            }}
            mode="parallax"
            modeConfig={
              isDesktop
                ? {
                    parallaxScrollingScale: 0.97,
                    parallaxScrollingOffset: 200,
                    parallaxAdjacentItemScale: 0.7,
                  }
                : {
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 150,
                    parallaxAdjacentItemScale: 0.45,
                  }
            }
            renderItem={({ item }) => (
              <PromoSlide
                item={item}
                onPress={onPressPromo}
                height={carouselHeight}
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
}

function PromoSlide({ item, onPress, height }: PromoSlideProps) {
  const imageUrl =
    item.fotos && item.fotos.length > 0 ? item.fotos[0].urlFoto : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={{ height, width: "100%", borderRadius: 16, overflow: "hidden" }}
      className="bg-card border border-border"
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: 0.85,
            backgroundColor: "#1E1B4B",
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ position: "absolute", height: "100%", width: "100%" }}
          className="bg-zinc-200 items-center justify-center"
        />
      )}

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: 16,
        }}
      >
        <View
          style={{ marginBottom: 8, alignSelf: "flex-start" }}
          className="rounded-sm bg-primary/90 px-2 py-1"
        >
          <ThemedText className="text-xs font-bold uppercase tracking-widest text-primary-foreground">
            Promoción
          </ThemedText>
        </View>
        <ThemedText
          className="mb-1 text-xl font-bold text-white"
          numberOfLines={1}
        >
          {item.nombre}
        </ThemedText>
        {item.descripcion && (
          <ThemedText
            className="text-sm text-white opacity-90"
            numberOfLines={2}
          >
            {item.descripcion}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}
