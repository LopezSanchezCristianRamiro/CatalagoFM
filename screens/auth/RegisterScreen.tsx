// screens/auth/RegisterScreen.tsx
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

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [nombre, setNombre] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validarEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    // Validaciones frontend
    if (
      !nombre.trim() ||
      !nombreUsuario.trim() ||
      !correo.trim() ||
      !password ||
      !passwordConfirmation
    ) {
      Toast.show({
        type: "error",
        text1: "Campos requeridos",
        text2: "Completa todos los campos",
      });
      return;
    }
    if (!validarEmail(correo.trim())) {
      Toast.show({
        type: "error",
        text1: "Correo inválido",
        text2: "Ingresa un formato de correo válido (ej: usuario@dominio.com)",
      });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Contraseña muy corta",
        text2: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }
    if (password !== passwordConfirmation) {
      Toast.show({
        type: "error",
        text1: "Contraseñas no coinciden",
        text2: "Ambas contraseñas deben ser iguales",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await httpClient.post<{
        token: string;
        user: any;
      }>(
        "/api/register",
        {
          nombre: nombre.trim(),
          nombreUsuario: nombreUsuario.trim(),
          correo: correo.trim(),
          password,
        },
        "Error al registrarse",
      );

      await login(response.token);
      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: `Bienvenido/a ${response.user.nombres}`,
      });
      router.replace("/(tabs)/catalogo");
    } catch (error: any) {
      // El backend devuelve mensajes descriptivos gracias a ValidationException
      Toast.show({
        type: "error",
        text1: "Error de registro",
        text2: error?.message ?? "Algo salió mal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8 pt-20 pb-10">
          <View className="mb-10">
            <ThemedText className="text-3xl font-bold mb-2">
              Crear cuenta
            </ThemedText>
            <ThemedText className="text-base text-muted-foreground">
              Únete a nuestra comunidad
            </ThemedText>
          </View>

          {/* Nombre */}
          <View className="mb-5">
            <ThemedText className="text-sm font-medium mb-2">
              Nombre completo
            </ThemedText>
            <TextInput
              className="w-full h-12 bg-white border border-border rounded-lg px-4 text-foreground"
              placeholder="Tu nombre"
              placeholderTextColor="#A1A1AA"
              value={nombre}
              onChangeText={setNombre}
              editable={!loading}
            />
          </View>

          {/* Nombre de usuario */}
          <View className="mb-5">
            <ThemedText className="text-sm font-medium mb-2">
              Nombre de usuario
            </ThemedText>
            <TextInput
              className="w-full h-12 bg-white border border-border rounded-lg px-4 text-foreground"
              placeholder="Usuario único"
              placeholderTextColor="#A1A1AA"
              autoCapitalize="none"
              value={nombreUsuario}
              onChangeText={setNombreUsuario}
              editable={!loading}
            />
          </View>

          {/* Correo */}
          <View className="mb-5">
            <ThemedText className="text-sm font-medium mb-2">
              Correo electrónico
            </ThemedText>
            <TextInput
              className="w-full h-12 bg-white border border-border rounded-lg px-4 text-foreground"
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#A1A1AA"
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={setCorreo}
              editable={!loading}
            />
          </View>

          {/* Contraseña con ícono de ojo */}
          <View className="mb-5">
            <ThemedText className="text-sm font-medium mb-2">
              Contraseña
            </ThemedText>
            <View className="relative">
              <TextInput
                className="w-full h-12 bg-white border border-border rounded-lg px-4 pr-12 text-foreground"
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#A1A1AA"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
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
            {password.length > 0 && password.length < 6 && (
              <ThemedText className="text-xs text-status-error mt-1">
                Mínimo 6 caracteres
              </ThemedText>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View className="mb-8">
            <ThemedText className="text-sm font-medium mb-2">
              Confirmar contraseña
            </ThemedText>
            <TextInput
              className="w-full h-12 bg-white border border-border rounded-lg px-4 text-foreground"
              placeholder="Repite la contraseña"
              placeholderTextColor="#A1A1AA"
              secureTextEntry={!showPassword}
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              editable={!loading}
            />
            {passwordConfirmation.length > 0 &&
              password !== passwordConfirmation && (
                <ThemedText className="text-xs text-status-error mt-1">
                  Las contraseñas no coinciden
                </ThemedText>
              )}
          </View>

          {/* Botón */}
          <TouchableOpacity
            className={`btn-tap-active h-12 bg-primary rounded-lg items-center justify-center ${
              loading ? "opacity-70" : ""
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText className="text-primary-foreground text-base font-semibold">
                Registrarse
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Enlace a login */}
          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="mt-6 items-center"
            disabled={loading}
          >
            <ThemedText className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <ThemedText className="font-semibold text-accent">
                Inicia sesión
              </ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
