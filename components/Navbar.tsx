import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useCartAnimation } from "../screens/catalogo/components/CartAnimationContext";
import { useCartStore } from "../store/cartStore";
import { ThemedText } from "./ThemedText";

interface NavbarProps {
  isAdmin: boolean;
}

// Filtramos las rutas centrales: Solo dejamos lo que es navegación general
const CENTER_ROUTES = [
  {
    name: "catalogo",
    label: "Catálogo",
    icon: "grid-outline",
    adminOnly: false,
  },
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

export function Navbar({ isAdmin }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const cartTotal = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0),
  );
  const { cartRef } = useCartAnimation();
  const activeColor = "#7C3AED";
  const inactiveColor = "#6B7280";

  const filteredCenter = CENTER_ROUTES.filter((r) => !r.adminOnly || isAdmin);

  return (
    <View className="bg-card w-full h-16 border-b border-border flex-row items-center px-8 justify-between z-50">
      {/* 1. LADO IZQUIERDO: Branding */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/catalogo")}
        className="flex-row items-center"
      >
        <Image
          source={require("../assets/images/logo.jpg")}
          className="w-10 h-10 rounded-md"
          contentFit="cover"
        />
        <ThemedText className="ml-3 text-lg font-bold tracking-tight">
          Streaming App
        </ThemedText>
      </TouchableOpacity>

      {/* 2. CENTRO: Navegación de contenido */}
      <View className="flex-row items-center space-x-1">
        {filteredCenter.map((item) => {
          const isActive = pathname?.includes(item.name);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(`/(tabs)/${item.name}` as any)}
              className={`flex-row items-center px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-primary/10" : "hover:bg-accent"
              }`}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={isActive ? activeColor : inactiveColor}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. LADO DERECHO: Carrito y Perfil */}
      <View className="flex-row items-center space-x-4">
        {/* ICONO CARRITO */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/carrito")}
          className={`p-2 rounded-full ${pathname?.includes("carrito") ? "bg-primary/10" : ""}`}
        >
          {/* ← Envuelve el View existente con ref */}
          <View
            ref={cartRef}
            collapsable={false}
            style={{ position: "relative" }}
          >
            <Ionicons
              name="cart-outline"
              size={24}
              color={pathname?.includes("carrito") ? activeColor : "#1f2937"}
            />
            {cartTotal > 0 && (
              <View className="absolute -top-2 -right-2 bg-primary rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border-2 border-white">
                <Text className="text-white text-[9px] font-black">
                  {cartTotal > 99 ? "99+" : cartTotal}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* BOTÓN PERFIL (Reemplaza Logout) */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/perfil")}
          className={`flex-row items-center pl-4 pr-2 py-1.5 rounded-full border border-border ${
            pathname?.includes("perfil")
              ? "bg-primary/10 border-primary/20"
              : "bg-secondary/50"
          }`}
        >
          <Text
            className={`mr-2 text-sm font-bold ${
              pathname?.includes("perfil") ? "text-primary" : "text-foreground"
            }`}
          >
            Perfil
          </Text>
          <View className="bg-primary/20 rounded-full p-1">
            <Ionicons name="person" size={18} color={activeColor} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
