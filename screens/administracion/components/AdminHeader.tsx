import { View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

export default function AdminHeader({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <View>
      <ThemedText className="text-base font-bold text-[#050816]">
        StreamSub
      </ThemedText>

      <ThemedText
        className={
          isMobile
            ? "text-4xl font-bold text-[#050816] mt-3"
            : "text-5xl font-bold text-[#050816] mt-3"
        }
      >
        Panel de Control
      </ThemedText>

      <ThemedText className="text-base text-gray-500 mt-1">
        Resumen de tu negocio de streaming hoy.
      </ThemedText>
    </View>
  );
}