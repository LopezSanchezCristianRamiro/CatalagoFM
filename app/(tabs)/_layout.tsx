// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { CustomTabBar } from "../../components/CustomTabBar";
import { useAuth } from "../../contexts/AuthContext";

export default function TabsLayout() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} isAdmin={isAdmin} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Públicas */}
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
      {/* Admin (siempre registradas, la barra las oculta si no es admin) */}
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
