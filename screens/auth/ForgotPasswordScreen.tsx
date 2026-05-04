// screens/auth/ForgotPasswordScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ThemedText } from "../../components/ThemedText";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80"
        >
          <Ionicons name="arrow-back" size={24} color="#1E1B4B" />
        </TouchableOpacity>

        <View className="flex-1 justify-center items-center px-8 pt-20 pb-10">
          <View className="w-full max-w-md">
            <View className="mb-10">
              <ThemedText className="text-3xl font-bold mb-2">
                Recuperar contraseña
              </ThemedText>

              <ThemedText className="text-base text-muted-foreground">
                Elige cómo quieres recuperar el acceso a tu cuenta.
              </ThemedText>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/recover-email")}
              activeOpacity={0.85}
              className="bg-white border border-border rounded-2xl p-5 mb-4 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-4">
                <Ionicons name="mail-outline" size={26} color="#7C3AED" />
              </View>

              <View className="flex-1">
                <ThemedText className="text-base font-bold text-foreground">
                  Recuperar por correo
                </ThemedText>

                <ThemedText className="text-sm text-muted-foreground mt-1">
                  Te enviaremos un código a tu correo registrado.
                </ThemedText>
              </View>

              <Ionicons name="chevron-forward" size={22} color="#71717A" />
            </TouchableOpacity>

          

            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="mt-6 items-center"
            >
              <ThemedText className="text-sm text-muted-foreground">
                ¿Ya recordaste tu contraseña?{" "}
                <ThemedText className="font-semibold text-accent">
                  Inicia sesión
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}