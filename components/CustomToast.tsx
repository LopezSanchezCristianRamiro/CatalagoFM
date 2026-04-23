import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

/**
 * Props que recibe el componente de Toast personalizado desde react-native-toast-message.
 * La librería inyecta automáticamente `text1`, `text2`, `hide`, `isVisible`, etc.
 */
interface CustomToastProps {
  text1?: string;
  text2?: string;
  hide?: () => void;
  isVisible?: boolean;
  type?: "success" | "error" | "info";
}

const borderColorMap = {
  success: "border-status-success",
  error: "border-status-error",
  info: "border-status-info",
};

/**
 * Componente de Toast personalizado que aplica las dimensiones y estilos
 * definidos en el Design System de Metasoft mediante NativeWind.
 *
 * Ancho fijo: 90% del contenedor padre con un máximo de 500px.
 * Alto: Definido por el padding vertical (`py-5`) y el contenido.
 */
export function CustomToast({
  text1,
  text2,
  hide,
  type = "info",
}: CustomToastProps) {
  const borderColorMap = {
    success: "border-status-success",
    error: "border-status-error",
    info: "border-status-info",
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={hide}
      className={`
        w-[95%] max-w-[500px] bg-white rounded-xl shadow-card 
        border-l-8 ${borderColorMap[type]} my-2 overflow-hidden
      `}
      accessibilityRole="alert"
    >
      <View className="px-6 py-5">
        {text1 && (
          <ThemedText className="font-bold text-xl text-surface-dark mb-2">
            {text1}
          </ThemedText>
        )}
        {text2 && (
          <ThemedText className="font-medium text-base text-surface-dark/70">
            {text2}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}
