import { View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

export default function EstadoBadge({ estado }: { estado: string }) {
  const getColor = () => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-200 text-yellow-800";
      case "pagado":
      case "entregado":
        return "bg-green-200 text-green-800";
      case "cancelado":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <View className={`px-3 py-1 rounded-full ${getColor()}`}>
      <ThemedText className="text-xs font-semibold capitalize">
        {estado}
      </ThemedText>
    </View>
  );
}