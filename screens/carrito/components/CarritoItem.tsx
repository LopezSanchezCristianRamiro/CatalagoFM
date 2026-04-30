// screens/carrito/components/CarritoItem.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import type { CartItem } from "../../../store/cartStore";

interface CarritoItemProps {
  item: CartItem;
  onIncrementar: () => void;
  onDecrementar: () => void;
  onUpdateCantidad: (cantidad: number) => void;
  onEliminar: () => void;
}

export function CarritoItem({
  item,
  onIncrementar,
  onDecrementar,
  onUpdateCantidad,
  onEliminar,
}: CarritoItemProps) {
  const precio = Number(item.precioDescuento ?? item.precio);
  const imageUrl = item.fotos?.[0]?.urlFoto ?? null;

  const [inputValue, setInputValue] = useState(String(item.cantidad));

  useEffect(() => {
    setInputValue(String(item.cantidad));
  }, [item.cantidad]);

  const handleEndEditing = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      if (parsed !== item.cantidad) {
        onUpdateCantidad(parsed);
      }
    } else {
      // Valor inválido, restaurar
      setInputValue(String(item.cantidad));
    }
  };

  return (
    <View className="bg-card border border-border rounded-2xl flex-row items-center px-4 py-3 mb-3 gap-3">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-14 h-14 rounded-xl bg-muted"
          resizeMode="cover"
        />
      ) : (
        <View className="w-14 h-14 rounded-xl bg-muted items-center justify-center">
          <Ionicons name="image-outline" size={24} color="#9CA3AF" />
        </View>
      )}

      <View className="flex-1 min-w-0">
        <ThemedText
          className="font-semibold text-foreground text-base"
          numberOfLines={1}
        >
          {item.nombre}
        </ThemedText>
        {item.precioDescuento && (
          <ThemedText className="text-muted-foreground text-xs line-through">
            Bs. {Number(item.precio).toFixed(2)}
          </ThemedText>
        )}
        <ThemedText className="font-bold text-foreground text-sm mt-0.5">
          Bs. {precio.toFixed(2)}
        </ThemedText>
      </View>

      <View className="flex-row items-center bg-secondary/10 gap-1.5">
        <Pressable
          onPress={onDecrementar}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center active:bg-primary/20 active:scale-90"
          accessibilityLabel="Reducir cantidad"
        >
          <Ionicons name="remove" size={18} color="#6B7280" />
        </Pressable>
        <View className="px-3 items-center justify-center">
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            selectTextOnFocus
            onSubmitEditing={handleEndEditing}
            onBlur={handleEndEditing}
            style={{ textAlignVertical: "center" }}
            className="w-12 h-11 text-center font-bold text-foreground text-sm bg-white border border-border rounded-lg py-1 px-1"
          />
        </View>
        <Pressable
          onPress={onIncrementar}
          className="w-8 h-8 rounded-full bg-muted items-center justify-center active:bg-primary/20 active:scale-90"
          accessibilityLabel="Aumentar cantidad"
        >
          <Ionicons name="add" size={18} color="#6B7280" />
        </Pressable>
      </View>

      <Pressable
        onPress={onEliminar}
        className="ml-1 w-8 h-8 items-center justify-center rounded-full active:bg-red-50"
        accessibilityLabel="Eliminar producto"
      >
        <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}
