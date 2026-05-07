// screens/carrito/components/Paso1Carrito.tsx
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../../../components/ThemedText";
import { CarritoItem } from "./CarritoItem";
import { ResumenPedido } from "./ResumenPedido";

interface Paso1CarritoProps {
  contentWidth: number;
  isDesktop: boolean;
  items: any[];
  subtotal: number;
  onIncrementar: (id: number) => void;
  onDecrementar: (id: number) => void;
  onEliminar: (id: number) => void;
  onUpdateCantidad: (id: number, cantidad: number) => void;
  onContinuar: () => void;
}

export function Paso1Carrito({
  contentWidth,
  isDesktop,
  items,
  subtotal,
  onIncrementar,
  onDecrementar,
  onEliminar,
  onUpdateCantidad,
  onContinuar,
}: Paso1CarritoProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ width: contentWidth, height: "100%" }}>
      <View className={`flex-1 ${isDesktop ? "flex-row" : "flex-col"}`}>
        <ScrollView
          className="flex-1 px-4 lg:p-10"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: 100,
          }}
        >
          <ThemedText className="text-4xl font-black mb-8">
            Tu Carrito
          </ThemedText>
          {items.map((item) => (
            <CarritoItem
              key={item.idProducto}
              item={item}
              onIncrementar={() => onIncrementar(item.idProducto)}
              onDecrementar={() => onDecrementar(item.idProducto)}
              onEliminar={() => onEliminar(item.idProducto)}
              onUpdateCantidad={(cantidad) =>
                onUpdateCantidad(item.idProducto, cantidad)
              }
            />
          ))}
        </ScrollView>

        {isDesktop && (
          <View className="p-10 pt-24">
            <ResumenPedido
              subtotal={subtotal}
              loading={false}
              buttonText="Continuar al pago"
              onPress={onContinuar}
              isDesktop
            />
          </View>
        )}
      </View>
    </View>
  );
}
