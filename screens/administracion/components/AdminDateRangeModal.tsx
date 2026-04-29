import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (inicio: string, fin: string) => void;
};

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatInput(date: Date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export default function AdminDateRangeModal({
  visible,
  onClose,
  onApply,
}: Props) {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [start, setStart] = useState<Date | null>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [end, setEnd] = useState<Date | null>(today);

  const days = useMemo(() => {
    const total = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: total }, (_, i) => i + 1),
    ];
  }, [month, year]);

  const changeMonth = (value: number) => {
    const next = new Date(year, month + value, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  const selectDay = (day: number) => {
    const selected = new Date(year, month, day);

    if (!start || (start && end)) {
      setStart(selected);
      setEnd(null);
      return;
    }

    if (selected < start) {
      setEnd(start);
      setStart(selected);
    } else {
      setEnd(selected);
    }
  };

  const isInRange = (day: number) => {
    if (!start || !end) return false;

    const current = new Date(year, month, day);
    return current >= start && current <= end;
  };

  const isSelected = (day: number) => {
    const current = new Date(year, month, day).toDateString();
    return start?.toDateString() === current || end?.toDateString() === current;
  };

  const setThisMonth = () => {
    const now = new Date();
    setMonth(now.getMonth());
    setYear(now.getFullYear());
    setStart(new Date(now.getFullYear(), now.getMonth(), 1));
    setEnd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  };

  const setLastMonth = () => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    setMonth(last.getMonth());
    setYear(last.getFullYear());
    setStart(new Date(last.getFullYear(), last.getMonth(), 1));
    setEnd(new Date(last.getFullYear(), last.getMonth() + 1, 0));
  };

  const setThisYear = () => {
    const now = new Date();
    setMonth(now.getMonth());
    setYear(now.getFullYear());
    setStart(new Date(now.getFullYear(), 0, 1));
    setEnd(new Date(now.getFullYear(), 11, 31));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/30 items-center justify-center px-4">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText className="text-2xl font-bold text-[#141442]">
              Seleccionar período
            </ThemedText>

            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <View className="flex-row gap-3 mb-5">
            {[
              ["Este mes", setThisMonth],
              ["Mes anterior", setLastMonth],
              ["Este año", setThisYear],
            ].map(([label, action]: any) => (
              <Pressable
                key={label}
                onPress={action}
                className="bg-purple-100 px-4 py-2 rounded-full"
              >
                <ThemedText className="text-purple-600 font-semibold">
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View className="bg-purple-50 rounded-2xl p-4 mb-5">
            <View className="flex-row justify-center items-center gap-5">
              <View className="items-center">
                <ThemedText className="text-xs text-gray-400 font-bold">
                  INICIO
                </ThemedText>
                <ThemedText className="text-purple-600 font-bold">
                  {start ? formatInput(start) : "--/--/----"}
                </ThemedText>
              </View>

              <ThemedText className="text-gray-400">→</ThemedText>

              <View className="items-center">
                <ThemedText className="text-xs text-gray-400 font-bold">
                  FIN
                </ThemedText>
                <ThemedText className="text-purple-600 font-bold">
                  {end ? formatInput(end) : "--/--/----"}
                </ThemedText>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Pressable
              onPress={() => changeMonth(-1)}
              className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={18} color="#7c3aed" />
            </Pressable>

            <ThemedText className="text-lg font-bold text-[#141442]">
              {meses[month]} {year}
            </ThemedText>

            <Pressable
              onPress={() => changeMonth(1)}
              className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center"
            >
              <Ionicons name="chevron-forward" size={18} color="#7c3aed" />
            </Pressable>
          </View>

          <View className="flex-row mb-2">
            {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
              <ThemedText
                key={d}
                className="flex-1 text-center text-gray-400 font-bold"
              >
                {d}
              </ThemedText>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {days.map((day, index) => {
              if (!day) return <View key={index} className="w-[14.28%] h-10" />;

              const active = isSelected(day);
              const range = isInRange(day);

              return (
                <Pressable
                  key={index}
                  onPress={() => selectDay(day)}
                  className={`w-[14.28%] h-10 items-center justify-center ${
                    range ? "bg-purple-100" : ""
                  }`}
                >
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      active ? "bg-purple-600" : ""
                    }`}
                  >
                    <ThemedText
                      className={`${
                        active ? "text-white font-bold" : "text-[#141442]"
                      }`}
                    >
                      {day}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-3 mt-6">
            <Pressable
              onPress={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-4"
            >
              <ThemedText className="text-center font-bold text-gray-600">
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => {
                onApply(start ? formatInput(start) : "", end ? formatInput(end) : "");
                onClose();
              }}
              className="flex-1 bg-purple-600 rounded-xl py-4"
            >
              <ThemedText className="text-center font-bold text-white">
                Aplicar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}