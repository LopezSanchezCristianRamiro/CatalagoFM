import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, ScrollView, View, useWindowDimensions } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { httpClient } from "../../http/httpClient";
import { useCartStore } from "../../store/cartStore";
import { CarritoItem } from "./components/CarritoItem";
import { CarritoVacio } from "./components/CarritoVacio";
import { ResumenPedido } from "./components/ResumenPedido";

export default function CarritoScreen() {
  const router = useRouter();
  const { items, removeFromCart, updateCantidad, clearCart, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const subtotal = Number(getTotal());
  
  const { width } = useWindowDimensions();
  const esPantallaGrande = width >= 768;

  const confirmarPedido = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      await httpClient.postAuth("/api/pedidos", {
        tipoPago: "efectivo",
        items: items.map((i) => ({
          idProducto: i.idProducto,
          cantidad: i.cantidad,
          precioUnitario: Number(i.precioDescuento ?? i.precio),
        })),
      });
      clearCart();
      Alert.alert("¡Pedido confirmado!", "Tu pedido fue enviado correctamente.", [
        { text: "OK", onPress: () => router.replace("/(tabs)/catalogo") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo confirmar el pedido");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return <CarritoVacio />;

  if (esPantallaGrande) {
    return (
      <View className="flex-1 flex-row items-start p-6 gap-6 bg-background">
        <ScrollView className="flex-1">
          <ThemedText className="text-2xl font-bold text-foreground mb-4">
            Tu Carrito
          </ThemedText>
          {items.map((item) => (
            <CarritoItem
              key={item.idProducto}
              item={item}
              onIncrementar={() => updateCantidad(item.idProducto, item.cantidad + 1)}
              onDecrementar={() => updateCantidad(item.idProducto, item.cantidad - 1)}
              onEliminar={() => removeFromCart(item.idProducto)}
            />
          ))}
        </ScrollView>

        <View style={{ width: 320, paddingTop: 52 }}>
          <ResumenPedido
            web
            subtotal={subtotal}
            loading={loading}
            onConfirmar={confirmarPedido}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        style={{ flex: 1 }} 
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
            onIncrementar={() => updateCantidad(item.idProducto, item.cantidad + 1)}
            onDecrementar={() => updateCantidad(item.idProducto, item.cantidad - 1)}
            onEliminar={() => removeFromCart(item.idProducto)}
          />
        )}
      />
      <ResumenPedido
        subtotal={subtotal}
        loading={loading}
        onConfirmar={confirmarPedido}
      />
    </View>
  );
}