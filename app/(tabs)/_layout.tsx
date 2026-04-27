// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { CustomTabBar } from "../../components/CustomTabBar";
import { Sidebar } from "../../components/Sidebar";
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
      <View className="flex-1 flex-row bg-background">
        <Sidebar isAdmin={isAdmin} />
        <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="catalogo" options={{ title: "Catálogo" }} />
          <Tabs.Screen name="carrito" options={{ title: "Carrito" }} />
          <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
          <Tabs.Screen name="productos" options={{ title: "Productos" }} />
          <Tabs.Screen name="administracion" options={{ title: "Dueño" }} />
        </Tabs>
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
