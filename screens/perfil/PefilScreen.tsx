// screens/perfil/PerfilScreen.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../contexts/AuthContext";
import { httpClient } from "../../http/httpClient";

export default function PerfilScreen() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch (e) {
      // ignorar
    }
    await logout();
    Toast.show({
      type: "success",
      text1: "Sesión cerrada",
      text2: "Vuelve pronto",
    });
    router.replace("/login");
    setLoggingOut(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <View className="w-full max-w-md items-center">
          <ThemedText className="text-xl">No has iniciado sesión</ThemedText>
          <TouchableOpacity
            className="mt-4 h-12 bg-primary rounded-lg items-center justify-center px-6"
            onPress={() => router.replace("/login")}
          >
            <ThemedText className="text-primary-foreground text-base font-semibold">
              Iniciar Sesión
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background items-center px-6 pt-16">
      <View className="w-full max-w-md">
        {/* Avatar genérico */}
        <View className="w-24 h-24 bg-muted rounded-full items-center justify-center self-center mb-6">
          <ThemedText className="text-3xl font-bold text-muted-foreground">
            {user.nombres?.charAt(0)?.toUpperCase() ?? "U"}
          </ThemedText>
        </View>

        <ThemedText className="text-2xl font-bold text-center mb-2">
          {user.nombres}
        </ThemedText>
        <ThemedText className="text-base text-muted-foreground text-center mb-6">
          @{user.nombreUsuario}
        </ThemedText>

        <View className="bg-white rounded-xl border border-border p-4 mb-6">
          <View className="flex-row justify-between py-2 border-b border-border">
            <ThemedText className="text-sm font-medium">Correo</ThemedText>
            <ThemedText className="text-sm text-muted-foreground">
              {user.correo}
            </ThemedText>
          </View>
          <View className="flex-row justify-between py-2">
            <ThemedText className="text-sm font-medium">Rol</ThemedText>
            <ThemedText className="text-sm text-muted-foreground">
              {user.rol}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          className={`btn-tap-active h-12 bg-primary rounded-lg items-center justify-center ${
            loggingOut ? "opacity-70" : ""
          }`}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText className="text-primary-foreground text-base font-semibold">
              Cerrar sesión
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
