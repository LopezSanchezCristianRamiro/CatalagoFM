import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { CategoriaCatalogo } from "../types/catalogo.types";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  categorias: CategoriaCatalogo[];
  categoriaActiva: number | null;
  setCategoriaActiva: (id: number | null) => void;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  categorias,
  categoriaActiva,
  setCategoriaActiva,
}: FilterBarProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  return (
    <View className="px-4 mb-4">
      {/* Buscador - Un poco más ancho en desktop si quieres */}
      <View
        className={`flex-row items-center bg-card border border-border rounded-xl px-4 shadow-sm mb-6 ${isDesktop ? "h-14 max-w-2xl" : "h-12"}`}
      >
        <Ionicons name="search" size={isDesktop ? 24 : 20} color="#6B7280" />
        <TextInput
          className={`flex-1 ml-3 text-foreground font-sans ${isDesktop ? "text-lg" : "text-base"}`}
          placeholder="Buscar por plataforma o categoría..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtros de Categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: isDesktop ? 16 : 8, paddingBottom: 4 }}
      >
        <TouchableOpacity
          onPress={() => setCategoriaActiva(null)}
          className={`rounded-full border items-center justify-center ${
            isDesktop ? "px-8 py-3" : "px-5 py-2"
          } ${
            categoriaActiva === null
              ? "bg-foreground border-foreground"
              : "bg-card border-border"
          }`}
        >
          <ThemedText
            className={`font-bold ${isDesktop ? "text-lg" : "text-sm"} ${
              categoriaActiva === null ? "text-white" : "text-foreground"
            }`}
          >
            Todos
          </ThemedText>
        </TouchableOpacity>

        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.idCategoria}
            onPress={() => setCategoriaActiva(cat.idCategoria)}
            className={`rounded-full border items-center justify-center ${
              isDesktop ? "px-8 py-3" : "px-5 py-2"
            } ${
              categoriaActiva === cat.idCategoria
                ? "bg-primary border-primary"
                : "bg-card border-border"
            }`}
          >
            <ThemedText
              className={`font-bold ${isDesktop ? "text-lg" : "text-sm"} ${
                categoriaActiva === cat.idCategoria
                  ? "text-white"
                  : "text-muted-foreground"
              }`}
            >
              {cat.nombre}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
