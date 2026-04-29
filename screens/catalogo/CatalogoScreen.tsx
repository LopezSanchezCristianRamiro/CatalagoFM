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
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          // QUITAMOS el paddingHorizontal aquí para que el carrusel ocupe toda la pantalla
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
        {/* Carrusel de promociones (Ahora ocupa el 100% del ancho) */}
        {promociones.length > 0 && (
          <PromoCarousel
            promociones={promociones}
            onPressPromo={(prod) =>
              router.push(`/catalogo/${prod.idProducto}` as any)
            }
          />
        )}

        {/* Barra de filtros con padding restaurado */}
        <View className="pt-6 px-4">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            setCategoriaActiva={setCategoriaActiva}
          />
        </View>

        {/* Estados de carga y vacío */}
        {showSpinnerInList && (
          <View className="py-20 px-4 items-center">
            <ActivityIndicator size="large" color="#7C3AED" />
            <ThemedText className="mt-4 text-muted-foreground">
              Buscando productos...
            </ThemedText>
          </View>
        )}

        {!loadingInit && !showSpinnerInList && productos.length === 0 && (
          <View className="py-20 px-4 items-center">
            <ThemedText className="text-muted-foreground">
              No se encontraron productos.
            </ThemedText>
          </View>
        )}

        {/* Grid fluido estilo Metasoft con padding restaurado */}
        {productos.length > 0 && (
          <>
            <View
              className="flex-row flex-wrap justify-center px-4"
              style={{ gap: 8 }}
            >
              {productos.map((item) => (
                <View
                  key={item.idProducto.toString()}
                  className="flex-1"
                  style={{
                    minWidth: minWidth,
                    maxWidth: maxWidth,
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
