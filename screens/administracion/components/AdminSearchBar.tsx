import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import AdminDateRangeModal from "./AdminDateRangeModal";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  fechaInicio: string;
  setFechaInicio: (value: string) => void;
  fechaFin: string;
  setFechaFin: (value: string) => void;
  isMobile?: boolean;
};

export default function AdminSearchBar({
  search,
  setSearch,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  isMobile = false,
}: Props) {
  const [openCalendar, setOpenCalendar] = useState(false);

  const periodoLabel =
    fechaInicio && fechaFin
      ? `${fechaInicio} → ${fechaFin}`
      : "Seleccionar período";

  return (
    <>
      <View
        className={
          isMobile
            ? "bg-white border border-gray-100 rounded-2xl p-4 shadow-sm gap-4"
            : "bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex-row gap-4 items-end"
        }
      >
        <View className={isMobile ? "w-full" : "flex-1"}>
          <ThemedText className="text-[10px] font-bold text-[#141442] mb-2">
            PERÍODO
          </ThemedText>

          <Pressable
            onPress={() => setOpenCalendar(true)}
            className="bg-[#f8f4f3] rounded-xl px-4 py-3 flex-row items-center"
          >
            <Ionicons name="calendar-outline" size={18} color="#7c3aed" />

            <ThemedText
              className={
                isMobile
                  ? "ml-2 text-xs font-semibold text-[#141442]"
                  : "ml-2 text-sm font-semibold text-[#141442]"
              }
            >
              {periodoLabel}
            </ThemedText>
          </Pressable>
        </View>

        <View className={isMobile ? "w-full" : "flex-[1.2]"}>
          <ThemedText className="text-[10px] font-bold text-[#141442] mb-2">
            BUSCAR
          </ThemedText>

          <View className="bg-[#f8f4f3] rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search-outline" size={18} color="#6b7280" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="ID de pedido, cliente..."
              placeholderTextColor="#9ca3af"
              className="flex-1 text-sm ml-2 outline-none"
            />
          </View>
        </View>
      </View>

      <AdminDateRangeModal
        visible={openCalendar}
        onClose={() => setOpenCalendar(false)}
        onApply={(inicio, fin) => {
          setFechaInicio(inicio);
          setFechaFin(fin);
        }}
      />
    </>
  );
}