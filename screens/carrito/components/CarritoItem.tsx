import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { CartItem } from "../../../store/cartStore";

interface CarritoItemProps {
  item: CartItem;
  onIncrementar: () => void;
  onDecrementar: () => void;
  onEliminar: () => void;
}

export function CarritoItem({
  item,
  onIncrementar,
  onDecrementar,
  onEliminar,
}: CarritoItemProps) {
  const precio = Number(item.precioDescuento ?? item.precio);
  const imageUrl = item.fotos?.[0]?.urlFoto ?? null;

  return (
    <View className="bg-card border border-border rounded-2xl flex-row items-center px-4 py-3 mb-3 gap-4">
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

      <View className="flex-1">
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
      </View>

      <ThemedText className="font-bold text-foreground text-base">
        Bs. {precio.toFixed(2)}
      </ThemedText>

      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={onEliminar} className="ml-1">
          <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}