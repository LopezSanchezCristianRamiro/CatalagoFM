import { Pressable, View } from "react-native";

type Props = {
  estado?: "activado" | "desactivado";
  onPress: () => void;
};

export default function ProductoEstadoSwitch({ estado, onPress }: Props) {
  const activado = estado === "activado";

  return (
    <Pressable
      onPress={onPress}
      className={`w-16 h-8 rounded-full p-1 ${
        activado ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <View
        className={`w-6 h-6 rounded-full bg-white ${
          activado ? "self-end" : "self-start"
        }`}
      />
    </Pressable>
  );
}