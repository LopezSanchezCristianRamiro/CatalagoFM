import { FlatList } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useCartStore } from "../../../store/cartStore";
import { CarritoItem } from "./CarritoItem";
import { CarritoVacio } from "./CarritoVacio";

export function Paso1Carrito() {
  const { items, removeFromCart, updateCantidad } = useCartStore();

  if (items.length === 0) {
    return <CarritoVacio />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.idProducto.toString()}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      ListHeaderComponent={
        <ThemedText className="text-2xl font-bold text-foreground mb-4">
          Tu Carrito
        </ThemedText>
      }
      renderItem={({ item }) => (
        <CarritoItem
          item={item}
          onIncrementar={() =>
            updateCantidad(item.idProducto, item.cantidad + 1)
          }
          onDecrementar={() =>
            updateCantidad(item.idProducto, item.cantidad - 1)
          }
          onEliminar={() => removeFromCart(item.idProducto)}
        />
      )}
    />
  );
}
