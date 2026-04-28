import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
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
  return (
    <View
      className="px-4 mb-4 animate-slide-up"
      style={{ animationDelay: "100ms" }}
    >
      {/* Buscador */}
      <View className="flex-row items-center bg-card border border-border rounded-lg px-4 h-12 shadow-soft mb-4">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-3 text-foreground font-sans text-base"
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
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          onPress={() => setCategoriaActiva(null)}
          className={`px-5 py-2 rounded-full border btn-tap-active ${
            categoriaActiva === null
              ? "bg-foreground border-foreground"
              : "bg-card border-border"
          }`}
        >
          <ThemedText
            className={`font-medium ${
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
            className={`px-4 py-2 rounded-full mr-2 ${
              categoriaActiva === cat.idCategoria ? "bg-primary" : "bg-card"
            }`}
          >
            <ThemedText>{cat.nombre}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
