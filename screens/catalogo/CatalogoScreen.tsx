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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor="#7C3AED"
          />
        }
      >
        {/* Carrusel de promociones (Ahora ocupa el 100% del ancho) */}
        {/* Carrusel de promociones o skeleton */}
        {loadingInit ? (
          <SkeletonPromoCarousel />
        ) : promociones.length > 0 ? (
          <PromoCarousel
            promociones={promociones}
            onPressPromo={(prod) =>
              router.push(`/catalogo/${prod.idProducto}` as any)
            }
          />
        ) : null}

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

        {/* Grid fluido estilo Metasoft con padding restaurado */}
        {loadingInit ? (
          <View
            className="flex-row flex-wrap justify-center px-4"
            style={{ gap: 16 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={`skeleton-${i}`}
                className="flex-1"
                style={{ minWidth: 280, maxWidth: 330 }}
              >
                <SkeletonProductCard />
              </View>
            ))}
            {/* Fantasmas para alinear */}
            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={`phantom-${i}`}
                className="flex-1"
                style={{ minWidth: 280, maxWidth: 330, height: 0 }}
                pointerEvents="none"
              />
            ))}
          </View>
        ) : applyingFilters && productos.length === 0 ? (
          <View
            className="flex-row flex-wrap justify-center px-4"
            style={{ gap: 16 }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={`filter-skeleton-${i}`}
                className="flex-1"
                style={{ minWidth: 280, maxWidth: 330 }}
              >
                <SkeletonProductCard />
              </View>
            ))}
            {/* Fantasmas para alinear */}
            {Array.from({ length: 4 }).map((_, i) => (
              <View
                key={`phantom-filter-${i}`}
                className="flex-1"
                style={{ minWidth: 280, maxWidth: 330, height: 0 }}
                pointerEvents="none"
              />
            ))}
          </View>
        ) : productos.length > 0 ? (
          <>
            <View
              className="flex-row flex-wrap justify-center px-4"
              style={{ gap: 16 }}
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
  onPress={() => {
    if (item.estado === "desactivado") {
      Toast.show({
        type: "error",
        text1: "Producto no disponible",
        text2: "Este producto no está disponible por el momento.",
        visibilityTime: 3000,
      });
      return;
    }

    router.push(`/catalogo/${item.idProducto}`);
  }}
/>
                </View>
              ))}
              {/* Fantasmas para alinear última fila */}
              {Array.from({ length: 4 }).map((_, i) => (
                <View
                  key={`phantom-${i}`}
                  className="flex-1"
                  style={{
                    minWidth: minWidth,
                    maxWidth: maxWidth,
                    height: 0,
                  }}
                  pointerEvents="none"
                />
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
      </ScrollView>
      <FlyingBubble />
    </View>
  );
}
