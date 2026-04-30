import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { ThemedText } from "../../../components/ThemedText";
import { ProductoCatalogo } from "../types/catalogo.types";

export function PromoCarousel({ promociones, onPressPromo }: { promociones: ProductoCatalogo[], onPressPromo: (p: ProductoCatalogo) => void }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const isDesktop = Platform.OS === "web" && containerWidth >= 1024;
  
  // Ajustamos la altura para que no sea tan gigante y "coma" espacio
  const carouselHeight = isDesktop ? 450 : 480; 

  if (!promociones || promociones.length === 0) return null;

  return (
    <View 
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} 
      style={{ width: "100%", marginBottom: -10 }} // Margen negativo suave para acercar el siguiente contenido
    >
      {containerWidth > 0 && (
        <Carousel
          loop autoPlay autoPlayInterval={5000}
          data={promociones}
          width={containerWidth}
          height={carouselHeight}
          // Quitamos el modo parallax en móvil si causa espacios raros
          mode={isDesktop ? "parallax" : undefined}
          modeConfig={{ parallaxScrollingScale: 0.95, parallaxScrollingOffset: 80 }}
          renderItem={({ item }) => (
            <View style={{ 
              width: containerWidth, 
              height: carouselHeight, 
              alignItems: 'center', 
              justifyContent: 'center',
              paddingVertical: 10 
            }}>
              <PromoSlide 
                item={item} 
                onPress={onPressPromo} 
                height={carouselHeight - 20} // Solo restamos lo del padding
                width={isDesktop ? containerWidth * 0.85 : containerWidth * 0.92}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

function PromoSlide({ item, onPress, height, width }: any) {
  const imageUrl = item.fotos?.[0]?.urlFoto;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={{
        height, width,
        borderRadius: 32,
        overflow: "hidden",
        backgroundColor: '#18181b',
        // Sombras optimizadas para que no empujen el layout
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {imageUrl && <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />}
      
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 25 }}>
        <View className="bg-white/20 self-start px-3 py-1 rounded-full backdrop-blur-md mb-2 border border-white/20">
          <ThemedText className="text-[8px] font-bold text-white uppercase tracking-widest">Sugerencia</ThemedText>
        </View>

        <ThemedText 
          className="font-black text-white text-3xl mb-2" 
          style={{ textShadowColor: 'black', textShadowRadius: 8 }}
          numberOfLines={1} // Evitamos que ocupe muchas líneas y crezca hacia abajo
        >
          {item.nombre}
        </ThemedText>

        <View className="flex-row items-center mt-2">
          <View className="bg-white px-5 py-2 rounded-full shadow-lg flex-row items-center">
            <Ionicons name="play-circle" size={16} color="black" style={{ marginRight: 6 }} />
            <ThemedText className="text-black font-bold text-[11px]">Ver detalles</ThemedText>
          </View>
          <ThemedText className="ml-4 text-white font-bold text-lg">Bs {item.precio}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}