// screens/auth/LoginScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../contexts/AuthContext";
import { httpClient } from "../../http/httpClient";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Campos requeridos",
        text2: "Ingresa usuario y contraseña",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.post<{
        token: string;
        user: any;
      }>("/api/login", { username, password }, "Error al iniciar sesión");

      await login(response.token);
      router.replace("/(tabs)/catalogo");
      Toast.show({
        type: "success",
        text1: "Bienvenido",
        text2: `Hola ${response.user?.nombreUsuario ?? ""}`,
      });
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80"
        >
          <Ionicons name="arrow-back" size={24} color="#1E1B4B" />
        </TouchableOpacity>
        {/* Contenedor centrado con ancho máximo */}
        <View className="flex-1 justify-center items-center px-8 pt-20 pb-10">
          <View className="w-full max-w-md">
            {/* Título */}
            <View className="mb-10">
              <ThemedText className="text-3xl font-bold mb-2">
                Iniciar Sesión
              </ThemedText>
              <ThemedText className="text-base text-muted-foreground">
                Ingresa tus credenciales para continuar
              </ThemedText>
            </View>

            {/* Campo Usuario */}
            <View className="mb-5">
              <ThemedText className="text-sm font-medium mb-2">
                Usuario o correo
              </ThemedText>
              <TextInput
                className="w-full h-12 bg-white border border-border rounded-lg px-4 text-foreground text-base"
                placeholder="Usuario"
                placeholderTextColor="#A1A1AA"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>

            {/* Campo Contraseña */}
            {/* Campo Contraseña */}
            <View className="mb-5">
              <ThemedText className="text-sm font-medium mb-2">
                Contraseña
              </ThemedText>
              <View className="relative">
                <TextInput
                  className="w-full h-12 bg-white border border-border rounded-lg px-4 pr-12 text-foreground"
                  placeholder="Tu contraseña"
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-0 h-12 justify-center"
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#71717A"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón */}
            <TouchableOpacity
              className={`mt-6 btn-tap-active h-12 bg-primary rounded-lg items-center justify-center ${
                loading ? "opacity-70" : ""
              }`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText className="text-primary-foreground text-base font-semibold">
                  Iniciar Sesión
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Enlace a registro */}
            <TouchableOpacity
              onPress={() => router.push("/register")}
              className="mt-6 items-center"
              disabled={loading}
            >
              <ThemedText className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <ThemedText className="font-semibold text-accent">
                  Regístrate
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
