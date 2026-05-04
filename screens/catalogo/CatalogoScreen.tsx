import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { FilterBar } from "./components/FilterBar";
import { FlyingBubble } from "./components/FlyingBubble";
import { ProductGridCard } from "./components/ProductGridCard";
import { PromoCarousel } from "./components/PromoCarousel";
import { SkeletonProductCard } from "./components/SkeletonProductCard";
import { SkeletonPromoCarousel } from "./components/SkeletonPromoCarousel";
import { useCatalogo } from "./hooks/useCatalogo";

export default function CatalogoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);

  const {
    productos,
    promociones,
    categorias,
    loadingInit,
    loadingProductos,
    refreshing,
    applyingFilters,
    searchQuery,
    setSearchQuery,
    categoriaActiva,
    setCategoriaActiva,
    loadMore,
    refreshAll,
    applyFilters,
    fetchInitialData,
  } = useCatalogo();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (loadingInit) return;
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, categoriaActiva]);

  const showSpinnerInList =
    (loadingInit || applyingFilters) && productos.length === 0;

  const scrollViewRef = useRef<ScrollView>(null);
  const isLoadMoreTriggered = useRef(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const threshold = 50;
      if (
        contentSize.height - layoutMeasurement.height - contentOffset.y <
        threshold
      ) {
        if (
          !isLoadMoreTriggered.current &&
          !loadingProductos &&
          productos.length > 0
        ) {
          isLoadMoreTriggered.current = true;
          loadMore();
        }
      } else {
        isLoadMoreTriggered.current = false;
      }
    },
    [loadingProductos, productos.length, loadMore],
  );

  const minWidth = 300;
  const maxWidth = 350;

  // Lógica de filtrado activa (incluye el foco del teclado)
  const isFiltering = searchQuery.length > 0 || categoriaActiva !== null || isFocused;

  return (
    <View style={{ flex: 1 }} className="bg-background">
      <ScrollView
        ref={scrollViewRef}
        keyboardDismissMode="on-drag" 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor="#7C3AED" />
        }
      >
        {/* Carrusel: solo si NO estamos buscando */}
        {!isFiltering && (
          <>
            {loadingInit ? (
              <SkeletonPromoCarousel />
            ) : promociones.length > 0 ? (
              <PromoCarousel
                promociones={promociones}
                onPressPromo={(prod) => router.push(`/catalogo/${prod.idProducto}` as any)}
              />
            ) : null}
          </>
        )}

        {/* 
            Contenedor de Filtros y Grid: 
            Aplica un padding top de seguridad cuando el carrusel desaparece.
        */}
        <View 
          style={{ 
            paddingTop: isFiltering 
              ? (insets.top + 24) // Barra de notificaciones + 24px de aire
              : (Platform.OS === 'web' ? 24 : 10) // Espacio normal si hay carrusel
          }}
        >
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={setCategoriaActiva}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Grid de productos */}
          {loadingInit ? (
            <View className="flex-row flex-wrap justify-center px-4" style={{ gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={`sk-${i}`} className="flex-1" style={{ minWidth: 280, maxWidth: 330 }}>
                  <SkeletonProductCard />
                </View>
              ))}
            </View>
          ) : applyingFilters && productos.length === 0 ? (
            <View className="flex-row flex-wrap justify-center px-4" style={{ gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={`f-sk-${i}`} className="flex-1" style={{ minWidth: 280, maxWidth: 330 }}>
                  <SkeletonProductCard />
                </View>
              ))}
            </View>
          ) : productos.length > 0 ? (
            <>
              <View className="flex-row flex-wrap justify-center px-4" style={{ gap: 16 }}>
                {productos.map((item) => (
                  <View key={item.idProducto.toString()} className="flex-1" style={{ minWidth, maxWidth }}>
                    <ProductGridCard
                      producto={item}
                      onPress={() => {
                        if (item.estado === "desactivado") {
                          Toast.show({
                            type: "error",
                            text1: "Producto no disponible",
                          });
                          return;
                        }
                        router.push(`/catalogo/${item.idProducto}`);
                      }}
                    />
                  </View>
                ))}
                {/* Fantasmas para alineación */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={`ph-${i}`} className="flex-1" style={{ minWidth, maxWidth, height: 0 }} pointerEvents="none" />
                ))}
              </View>

              {(loadingProductos || applyingFilters) && (
                <View className="py-6 items-center">
                  <ActivityIndicator size="large" color="#7C3AED" />
                </View>
              )}
            </>
          ) : (
            !showSpinnerInList && (
              <View className="py-20 px-4 items-center">
                <ThemedText className="text-muted-foreground">
                  No se encontraron productos.
                </ThemedText>
              </View>
            )
          )}
        </View>
      </ScrollView>
      <FlyingBubble />
    </View>
  );
}