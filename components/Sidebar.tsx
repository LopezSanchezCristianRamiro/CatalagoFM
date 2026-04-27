// components/Sidebar.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react"; // ← añadir useState
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../contexts/AuthContext";
import { httpClient } from "../http/httpClient";
import { ThemedText } from "./ThemedText";

interface SidebarProps {
  isAdmin: boolean;
}

const ROUTES = [
  {
    name: "catalogo",
    label: "Catálogo",
    icon: "grid-outline",
    adminOnly: false,
  },
  { name: "carrito", label: "Carrito", icon: "cart-outline", adminOnly: false },
  { name: "perfil", label: "Perfil", icon: "person-outline", adminOnly: false },
  {
    name: "productos",
    label: "Productos",
    icon: "add-circle-outline",
    adminOnly: true,
  },
  {
    name: "administracion",
    label: "Dueño",
    icon: "bar-chart-outline",
    adminOnly: true,
  },
];

export function Sidebar({ isAdmin }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false); // ← nuevo estado

  const activeColor = "#FFFFFF";
  const inactiveColor = "#000";

  const handleLogout = async () => {
    setLoggingOut(true); // activamos el spinner
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch (e) {}
    await logout();
    Toast.show({
      type: "success",
      text1: "Sesión cerrada",
      text2: "Vuelve pronto",
    });
    router.replace("/login");
    setLoggingOut(false); // por si acaso, aunque la redirección lo desmonta
  };

  const filtered = ROUTES.filter((r) => !r.adminOnly || isAdmin);

  return (
    <View className="bg-secondary w-[220px] h-full border-r border-border pt-12 px-4">
      <ScrollView>
        {/* Perfil (igual que antes) */}
        <View className="mb-6 px-2 items-center">
          <Image
            source={require("../assets/images/logo.jpg")}
            className="w-16 h-16 rounded-md"
            contentFit="cover"
          />
          <ThemedText className="text-foreground text-base font-bold mt-3 text-center">
            Streaming App
          </ThemedText>
        </View>
        {/* Navegación (sin cambios) */}
        <View className="mb-4">
          {filtered.map((item) => {
            const isActive = pathname?.includes(item.name);
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => router.push(`/(tabs)/${item.name}` as any)}
                className={`flex-row items-center px-3 py-3 rounded-md mb-1 ${
                  isActive ? "bg-accent" : "bg-transparent"
                }`}
                accessibilityRole="button"
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isActive ? activeColor : inactiveColor}
                />
                <Text
                  className={`ml-3 text-base font-medium ${
                    isActive ? "text-white" : "text-foreground"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Cerrar sesión (MODIFICADO) */}
        {user && (
          <View className="border-t border-border pt-4 mt-2">
            <TouchableOpacity
              onPress={handleLogout}
              disabled={loggingOut} // deshabilitamos mientras se está cerrando sesión
              className={`flex-row items-center px-3 py-2 ${loggingOut ? "opacity-70" : ""}`}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              )}
              <ThemedText className="ml-3 text-base text-red-500 font-medium">
                {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
