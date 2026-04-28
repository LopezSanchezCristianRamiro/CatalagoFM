import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useCartStore } from "../../../store/cartStore";
import { ProductoCatalogo } from "../types/catalogo.types";

interface ProductGridCardProps {
  producto: ProductoCatalogo;
  onPress: () => void;
  anchoColumna: number;
}

export function ProductGridCard({
  producto,
  onPress,
  anchoColumna,
}: ProductGridCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(producto as any); // Se asume que el store se adaptará a la interfaz Producto actual
  };

  const imageUrl =
    producto.fotos && producto.fotos.length > 0
      ? producto.fotos[0].urlFoto
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{ width: anchoColumna }}
      className="p-2"
    >
      <View className="bg-card rounded-xl overflow-hidden border border-border">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-36 bg-zinc-100 object-cover"
          />
        ) : (
          <View className="w-full h-36 bg-zinc-200 items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        <View className="p-3">
          <ThemedText
            className="font-bold text-foreground text-base mb-1"
            numberOfLines={1}
          >
            {producto.nombre}
          </ThemedText>

          <View className="flex-row items-center justify-between mt-2">
            <View>
              {producto.precioDescuento ? (
                <>
                  <ThemedText className="font-bold text-primary text-lg leading-tight">
                    Bs {producto.precioDescuento}
                  </ThemedText>
                  <ThemedText className="text-muted-foreground text-xs line-through leading-tight">
                    Bs {producto.precio}
                  </ThemedText>
                </>
              ) : (
                <ThemedText className="font-bold text-primary text-lg">
                  Bs {producto.precio}
                </ThemedText>
              )}
            </View>

            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-primary w-8 h-8 rounded-full items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
