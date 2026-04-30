import { Image, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

export default function PedidoProductoItem({ item }: any) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3 border-t border-gray-100">
      <View className="flex-row items-center flex-1">
       <Image
  source={
    item.producto?.imagen
      ? { uri: item.producto.imagen }
      : { uri: "https://dummyimage.com/80x80/cccccc/000000&text=Img" }
  }
  style={{
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 16,
  }}
  resizeMode="cover"
/>
        <View className="flex-1">
          <ThemedText className="text-base font-bold text-[#141442]">
            {item.producto?.nombre || "Producto"}
          </ThemedText>

          <ThemedText className="text-sm text-gray-500 mt-1">
            {item.cantidad} x Bs. {Number(item.precioUnitario).toFixed(2)}
          </ThemedText>
        </View>
      </View>

      <ThemedText className="text-purple-600 font-bold text-base">
        Bs. {Number(item.subTotal).toFixed(2)}
      </ThemedText>
    </View>
  );
}