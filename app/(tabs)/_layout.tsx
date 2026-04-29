// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { CustomTabBar } from "../../components/CustomTabBar";
import { Navbar } from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";

export default function TabsLayout() {
  const { user, loading, isAdmin } = useAuth();
  const { isDesktop } = useResponsive();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // ===== ESCRITORIO: sidebar + contenido =====
  if (isDesktop) {
    return (
      <View className="flex-1 flex-column bg-background">
        {/* Ahora es un Navbar horizontal arriba */}
        <Navbar isAdmin={isAdmin} />

        <View className="flex-1">
          <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="catalogo" />
            <Tabs.Screen name="carrito" />
            <Tabs.Screen name="perfil" />
            <Tabs.Screen name="productos" />
            <Tabs.Screen name="administracion" />
          </Tabs>
        </View>
      </View>
    );
  }

  // ===== MÓVIL: tabs inferiores =====
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} isAdmin={isAdmin} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="catalogo"
        options={{
          tabBarLabel: "Catálogo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          tabBarLabel: "Carrito",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          tabBarLabel: "Productos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="administracion"
        options={{
          tabBarLabel: "Dueño",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
