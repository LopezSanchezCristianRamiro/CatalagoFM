import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { productoService } from "../services/productoService";
import { Categoria } from "../types/producto.types";

type Props = {
  categoriaEditando: Categoria | null;
  onSaved: () => void;
  onCancel: () => void;
};

export default function CategoriaForm({
  categoriaEditando,
  onSaved,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNombre(categoriaEditando?.nombre ?? "");
  }, [categoriaEditando]);

  const guardar = async () => {
    try {
      if (!nombre.trim()) {
        Alert.alert("Error", "El nombre de la categoría es obligatorio.");
        return;
      }

      setSaving(true);

      if (categoriaEditando) {
        await productoService.updateCategoria(
          categoriaEditando.idCategoria,
          {
            nombre: nombre.trim(),
          }
        );
      } else {
        await productoService.createCategoria({
          nombre: nombre.trim(),
        });
      }

      setNombre("");
      onSaved();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo guardar la categoría."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="gap-5">
      <View>
        <ThemedText className="text-slate-700 font-semibold mb-2">
          Nombre de categoría
        </ThemedText>

        <TextInput
          placeholder="Ej: Streaming"
          placeholderTextColor="#94a3b8"
          value={nombre}
          onChangeText={setNombre}
          editable={!saving}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-950"
        />
      </View>

      <View className="flex-row gap-3 mt-2">
        <Pressable
          onPress={onCancel}
          disabled={saving}
          className={`flex-1 rounded-2xl py-4 ${
            saving ? "bg-slate-200" : "bg-slate-100"
          }`}
        >
          <ThemedText className="text-center text-slate-700 font-bold">
            Descartar
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={guardar}
          disabled={saving}
          className={`flex-1 rounded-2xl py-4 items-center ${
            saving ? "bg-purple-400" : "bg-purple-700"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText className="text-white font-bold">
              {categoriaEditando ? "Actualizar" : "Guardar"}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}