// screens/catalogo/CatalogoScreen.tsx
import { View } from "react-native";
import { ThemedText } from "../../components/ThemedText";

export default function ProductosScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ThemedText className="text-2xl font-bold">Productos</ThemedText>
    </View>
  );
}
