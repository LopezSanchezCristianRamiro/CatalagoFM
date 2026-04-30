// screens/catalogo/components/FilterBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    <View className="px-6 mb-10">
      {/* Buscador cápsula moderno */}
      <View
        className={`flex-row items-center rounded-full px-6 mx-auto mb-8 ${
          isDesktop ? "h-14 w-1/2" : "h-12 w-full"
        }`}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.05)",
        }}
      >
        <Ionicons name="search" size={18} color="#A855F7" />
        <TextInput
          className="flex-1 ml-3 text-base font-medium text-foreground"
          placeholder="¿Qué servicio buscas?"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          // Quita el molesto outline azul en Web
          style={{ outlineStyle: "none" } as any}
        />
      </View>

      {/* Categorías: minimalistas con línea de gradiente */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: isDesktop ? "center" : "flex-start",
          width: isDesktop ? "100%" : "auto",
        }}
      >
        <View className="flex-row items-center">
          {/* Botón "Todos" */}
          <TouchableOpacity
            onPress={() => setCategoriaActiva(null)}
            className="mr-8 items-center"
          >
            <ThemedText
              className={`text-[11px] font-black uppercase tracking-[2px] ${
                categoriaActiva === null ? "text-foreground" : "text-zinc-400"
              }`}
            >
              Todos
            </ThemedText>
            {categoriaActiva === null && (
              <LinearGradient
                colors={["#8B5CF6", "#D946EF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-[3px] w-full mt-1 rounded-full"
              />
            )}
          </TouchableOpacity>

          {/* Mapeo de categorías */}
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.idCategoria}
              onPress={() => setCategoriaActiva(cat.idCategoria)}
              className="mr-8 items-center"
            >
              <ThemedText
                className={`text-[11px] font-black uppercase tracking-[2px] ${
                  categoriaActiva === cat.idCategoria
                    ? "text-foreground"
                    : "text-zinc-400"
                }`}
              >
                {cat.nombre}
              </ThemedText>
              {categoriaActiva === cat.idCategoria && (
                <LinearGradient
                  colors={["#8B5CF6", "#D946EF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-[3px] w-full mt-1 rounded-full"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
