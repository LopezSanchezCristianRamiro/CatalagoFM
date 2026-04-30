// screens/catalogo/components/SkeletonProductCard.tsx
import React from "react";
import { View } from "react-native";
import { Shimmer } from "./Shimmer";

export function SkeletonProductCard() {
  return (
    <View className="w-full p-2">
      <View className="bg-card rounded-xl overflow-hidden border border-border">
        {/* Imagen simulada */}
        <Shimmer width="100%" height={144} borderRadius={0} />
        <View className="p-3 gap-2">
          {/* Título */}
          <Shimmer width="70%" height={16} borderRadius={4} />
          {/* Precio */}
          <View className="flex-row justify-between items-center mt-2">
            <Shimmer width={80} height={20} borderRadius={4} />
            {/* Botón circular */}
            <Shimmer width={48} height={48} borderRadius={24} />
          </View>
        </View>
      </View>
    </View>
  );
}
