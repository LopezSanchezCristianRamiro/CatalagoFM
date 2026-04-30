import { Modal, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { ThemedText } from "../../../components/ThemedText";

type Option = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  title: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export default function AdminSelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: Props) {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        
        <View
          className="bg-white rounded-2xl p-6 w-full"
          style={{
            maxWidth: isMobile ? "100%" : 500,   // 🔥 controla ancho
            maxHeight: "80%",                   // 🔥 evita que crezca infinito
          }}
        >
          <ThemedText className="text-2xl font-bold text-[#050816] mb-6">
            {title}
          </ThemedText>

          {/* 🔥 SCROLL INTERNO */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
                className={`py-4 border-b border-gray-200 ${
                  item.value === selectedValue ? "bg-gray-100 rounded-md px-2" : ""
                }`}
              >
                <ThemedText className="text-base text-[#050816]">
                  {item.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            className="bg-[#0f172a] rounded-xl py-4 mt-6"
          >
            <ThemedText className="text-white text-center font-bold">
              Cerrar
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}