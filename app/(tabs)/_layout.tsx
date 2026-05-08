// app/(tabs)/_layout.tsx

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { CustomTabBar } from "../../components/CustomTabBar";
import { Navbar } from "../../components/Navbar";
import NotificationsButton from "../../components/NotificationsButton";

import { useAuth } from "../../contexts/AuthContext";
import { useResponsive } from "../../hooks/useResponsive";

export default function TabsLayout() {
  const { loading, isAdmin, isMaster, user } = useAuth();
  const { isDesktop } = useResponsive();

  const puedeVerAdmin = isAdmin || isMaster;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (isDesktop) {
    return (
      <View className="flex-1 bg-background">
        <Navbar isAdmin={puedeVerAdmin} />

        <View className="flex-1">
          <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="catalogo" />
            <Tabs.Screen name="carrito" />
            <Tabs.Screen name="perfil" />

            <Tabs.Screen
              name="productos"
              options={{
                href: puedeVerAdmin ? undefined : null,
              }}
            />

            <Tabs.Screen
              name="administracion"
              options={{
                href: puedeVerAdmin ? undefined : null,
              }}
            />
          </Tabs>
        </View>

        <NotificationsButton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} isAdmin={puedeVerAdmin} />
        )}
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
            tabBarLabel: user ? user.nombres?.split(" ")[0] ?? "Perfil" : "Perfil",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="productos"
          options={{
            href: puedeVerAdmin ? undefined : null,
            tabBarLabel: "Productos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="administracion"
          options={{
            href: puedeVerAdmin ? undefined : null,
            tabBarLabel: "Dueño",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <NotificationsButton />
    </View>
  );
}