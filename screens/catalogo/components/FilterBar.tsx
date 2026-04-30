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

export function FilterBar({ searchQuery, setSearchQuery, categorias, categoriaActiva, setCategoriaActiva }: any) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  return (
    <View className="px-6 mb-10">
      
      {/* 1. BUSCADOR: Estilo "Cápsula" Moderno */}
      <View
        className={`flex-row items-center rounded-full px-6 mb-8 mx-auto ${
          isDesktop ? "h-14 w-1/2" : "h-12 w-full"
        }`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.05)', // Fondo gris muy suave
          // Quitamos el border negro feo
        }}
      >
        <Ionicons name="search" size={18} color="#A855F7" />
        <TextInput
          className="flex-1 ml-3 text-base font-medium"
          placeholder="¿Qué servicio buscas?"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ outlineStyle: 'none' } as any} // Quita el borde azul en Web
        />
      </View>

      {/* 2. CATEGORÍAS: Minimalismo con Aire */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          alignItems: 'center', 
          justifyContent: isDesktop ? 'center' : 'flex-start',
          width: isDesktop ? '100%' : 'auto' 
        }}
      >
        <View className="flex-row items-center">
          {/* BOTÓN TODOS */}
          <TouchableOpacity 
            onPress={() => setCategoriaActiva(null)} 
            className="mr-8 items-center"
          >
            <ThemedText 
              className={`text-[11px] font-black uppercase tracking-[2px] ${
                categoriaActiva === null ? "text-black" : "text-zinc-400"
              }`}
            >
              Todos
            </ThemedText>
            {categoriaActiva === null && (
              <LinearGradient
                colors={["#8B5CF6", "#D946EF"]}
                start={{x:0, y:0}} end={{x:1, y:0}}
                className="h-[3px] w-full mt-1 rounded-full"
              />
            )}
          </TouchableOpacity>

          {/* MAPEO DE CATEGORÍAS */}
          {categorias.map((cat: any) => (
            <TouchableOpacity 
              key={cat.idCategoria} 
              onPress={() => setCategoriaActiva(cat.idCategoria)}
              className="mr-8 items-center"
            >
              <ThemedText 
                className={`text-[11px] font-black uppercase tracking-[2px] ${
                  categoriaActiva === cat.idCategoria ? "text-black" : "text-zinc-400"
                }`}
              >
                {cat.nombre}
              </ThemedText>
              {categoriaActiva === cat.idCategoria && (
                <LinearGradient
                  colors={["#8B5CF6", "#D946EF"]}
                  start={{x:0, y:0}} end={{x:1, y:0}}
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