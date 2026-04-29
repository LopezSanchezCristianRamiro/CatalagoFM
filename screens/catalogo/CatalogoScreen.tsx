import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { FilterBar } from "./components/FilterBar";
import { ProductGridCard } from "./components/ProductGridCard";
import { PromoCarousel } from "./components/PromoCarousel";
import { useCatalogo } from "./hooks/useCatalogo";

export default function CatalogoScreen() {
  const router = useRouter();

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

  // Carga inicial única
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filtrado con debounce
  useEffect(() => {
    if (loadingInit) return;
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, categoriaActiva]);

  const showSpinnerInList =
    (loadingInit || applyingFilters) && productos.length === 0;

  // Paginación infinita
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
  return (
    <View style={{ flex: 1 }} className="bg-background">
      {/* Header fijo */}
      <View className="pt-6 px-4">
        <ThemedText className="text-3xl font-bold text-foreground leading-tight text-center mb-4">
          Catálogo{"\n"}Digital
        </ThemedText>

        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          setCategoriaActiva={setCategoriaActiva}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showSpinnerInList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor="#7C3AED"
          />
        }
      >
        {/* Carrusel de promociones */}
        {promociones.length > 0 && (
          <PromoCarousel
            promociones={promociones}
            onPressPromo={(prod) =>
              router.push(`/catalogo/${prod.idProducto}` as any)
            }
          />
        )}

        {/* Estados de carga y vacío */}
        {showSpinnerInList && (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#7C3AED" />
            <ThemedText className="mt-4 text-muted-foreground">
              Buscando productos...
            </ThemedText>
          </View>
        )}

        {!loadingInit && !showSpinnerInList && productos.length === 0 && (
          <View className="py-20 items-center">
            <ThemedText className="text-muted-foreground">
              No se encontraron productos.
            </ThemedText>
          </View>
        )}

        {/* Grid fluido estilo Metasoft */}
        {productos.length > 0 && (
          <>
            <View
              className="flex-row flex-wrap justify-center"
              style={{ gap: 8 }}
            >
              {productos.map((item) => (
                <View
                  key={item.idProducto.toString()}
                  className="flex-1"
                  style={{
                    minWidth: minWidth, // en vez de 150
                    maxWidth: maxWidth, // en vez de 280
                  }}
                >
                  <ProductGridCard
                    producto={item}
                    onPress={() =>
                      router.push(`/catalogo/${item.idProducto}` as any)
                    }
                  />
                </View>
              ))}
              {/* Fantasmas para alinear última fila */}
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={`phantom-${i}`}
                  className="flex-1"
                  style={{ minWidth: minWidth, maxWidth: maxWidth, height: 0 }}
                  pointerEvents="none"
                />
              ))}
            </View>

            {loadingProductos && (
              <View className="py-6 items-center">
                <ActivityIndicator size="large" color="#7C3AED" />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
