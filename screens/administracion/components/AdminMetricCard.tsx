import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

type Props = {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  isMobile?: boolean;
};

export default function AdminMetricCard({
  title,
  value,
  subtitle,
  icon,
  isMobile = false,
}: Props) {
  return (
    <View
      className={
        isMobile
          ? "bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full"
          : "flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-h-[130px]"
      }
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <ThemedText className="text-[11px] text-[#141442] mb-2">
            {title}
          </ThemedText>

          <ThemedText
            className={
              isMobile
                ? "text-2xl font-bold text-[#050816]"
                : "text-3xl font-bold text-[#050816]"
            }
          >
            {value}
          </ThemedText>

          <ThemedText className="text-[11px] text-purple-600 mt-1">
            {subtitle}
          </ThemedText>
        </View>

        <View
          className={
            isMobile
              ? "w-8 h-8 rounded-full bg-[#f3eeee] items-center justify-center"
              : "w-9 h-9 rounded-full bg-[#f3eeee] items-center justify-center"
          }
        >
          <Ionicons
            name={icon}
            size={isMobile ? 16 : 18}
            color="#050816"
          />
        </View>
      </View>
    </View>
  );
}