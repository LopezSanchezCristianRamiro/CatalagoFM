import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";

import { FilterBar } from "./components/FilterBar";
import { ProductGridCard } from "./components/ProductGridCard";
import { PromoCarousel } from "./components/PromoCarousel";
import { useCatalogo } from "./hooks/useCatalogo";

export default function CatalogoScreen() {
  const router = useRouter();
  const dims = useWindowDimensions();

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

  const numColumns = useMemo(() => {
    if (dims.width >= 1024) return 4;
    if (dims.width >= 768) return 3;
    return 2;
  }, [dims.width]);

  const columnWidth = (dims.width - 32) / numColumns;

  const showSpinnerInList =
    (loadingInit || applyingFilters) && productos.length === 0;

  const phantomCount =
    productos.length > 0
      ? (numColumns - (productos.length % numColumns)) % numColumns
      : 0;

  return (
    <View style={{ flex: 1 }} className="bg-background">
      {/* Header fijo (no dentro del FlatList) */}
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

      <FlatList
        key={`grid-${numColumns}`}
        data={productos}
        keyExtractor={(item) => item.idProducto.toString()}
        numColumns={numColumns}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        columnWrapperStyle={
          numColumns > 1 ? { gap: 0, justifyContent: "flex-start" } : undefined
        }
        ListHeaderComponent={
          promociones.length > 0 ? (
            <PromoCarousel
              promociones={promociones}
              onPressPromo={(prod) =>
                router.push(`/productos/${prod.idProducto}` as any)
              }
            />
          ) : null
        }
        ListFooterComponent={
          <View>
            {loadingProductos && productos.length > 0 && !applyingFilters ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="large" color="#7C3AED" />
              </View>
            ) : null}
            {/* Elementos fantasma para alinear última fila */}
            {phantomCount > 0 && !loadingProductos ? (
              <View className="flex-row">
                {Array.from({ length: phantomCount }).map((_, i) => (
                  <View
                    key={`phantom-${i}`}
                    style={{ width: columnWidth, margin: 0 }}
                    pointerEvents="none"
                  />
                ))}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          showSpinnerInList ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#7C3AED" />
              <ThemedText className="mt-4 text-muted-foreground">
                Buscando productos...
              </ThemedText>
            </View>
          ) : !loadingInit && productos.length === 0 ? (
            <View className="py-20 items-center">
              <ThemedText className="text-muted-foreground">
                No se encontraron productos.
              </ThemedText>
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor="#7C3AED"
          />
        }
        renderItem={({ item }) => (
          <ProductGridCard
            producto={item}
            anchoColumna={columnWidth}
            onPress={() => router.push(`/productos/${item.idProducto}` as any)}
          />
        )}
        scrollEnabled={!showSpinnerInList}
      />
    </View>
  );
}
