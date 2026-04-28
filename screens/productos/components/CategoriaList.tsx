import React from "react";
import { Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Categoria } from "../types/producto.types";

type Props = {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
};

export default function CategoriaList({ categorias, onEdit, onDelete }: Props) {
  return (
    <View className="bg-slate-900 rounded-2xl p-4 border border-slate-700 gap-3">
      <ThemedText className="text-white text-xl font-bold">
        Categorías
      </ThemedText>

      {categorias.map((cat) => (
        <View
          key={cat.idCategoria}
          className="flex-row justify-between items-center bg-slate-950 rounded-xl p-3"
        >
          <ThemedText className="text-white">{cat.nombre}</ThemedText>

          <View className="flex-row gap-2">
            <Pressable onPress={() => onEdit(cat)}>
              <ThemedText className="text-blue-400">Editar</ThemedText>
            </Pressable>

            <Pressable onPress={() => onDelete(cat.idCategoria)}>
              <ThemedText className="text-red-400">Eliminar</ThemedText>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}