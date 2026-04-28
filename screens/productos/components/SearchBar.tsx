import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar...",
}: Props) {
  return (
    <View className="bg-white rounded-xl px-4 py-3 flex-row items-center gap-2 mb-5 shadow-sm border border-slate-200">
      <Ionicons name="search" size={18} color="#94a3b8" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        className="flex-1 text-slate-900"
        style={{
          outlineWidth: 0,
          outlineColor: "transparent",
          borderWidth: 0,
          boxShadow: "none",
        }}
      />
    </View>
  );
}