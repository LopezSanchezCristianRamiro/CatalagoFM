// components/CustomTabBar.tsx
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useCartAnimation } from "../screens/catalogo/components/CartAnimationContext";
import { CartBadge } from "./CartBadge";
import { ThemedText } from "./ThemedText";

interface CustomTabBarProps extends BottomTabBarProps {
  isAdmin: boolean;
}

const ADMIN_ONLY_ROUTES = ["productos", "administracion"];

export function CustomTabBar({
  state,
  descriptors,
  navigation,
  isAdmin,
}: CustomTabBarProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { cartRef } = useCartAnimation();
  const filteredRoutes = state.routes.filter(
    (route) => !(!isAdmin && ADMIN_ONLY_ROUTES.includes(route.name)),
  );

  // Colores de la paleta Lavanda Eléctrica
  const activeColor = "#7C3AED"; // primary (violeta)
  const inactiveColor = "#6B7280"; // muted-foreground

  return (
    <View
      className="bg-card border-t border-border"
      style={{
        paddingBottom: insets.bottom + 5,
        paddingTop: 5,
        height: 60 + insets.bottom,
      }}
    >
      <View className="flex-row">
        {filteredRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconColor = isFocused ? activeColor : inactiveColor;

          const isPerfilRoute = route.name === "perfil";
          const icon = isPerfilRoute
            ? user?.foto
              ? <Image
                  source={{ uri: user.foto }}
                  style={{ width: 24, height: 24, borderRadius: 12 }}
                  contentFit="cover"
                />
              : user
                ? <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: isFocused ? "#7C3AED" : "#6B7280",
                    alignItems: "center", justifyContent: "center"
                  }}>
                    <ThemedText style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>
                      {user.nombres?.charAt(0)?.toUpperCase() ?? "U"}
                    </ThemedText>
                  </View>
                : options.tabBarIcon?.({ focused: isFocused, color: iconColor, size: 24 }) ?? null
            : options.tabBarIcon
              ? (options.tabBarIcon as any)({ focused: isFocused, color: iconColor, size: 24 })
              : null;

          const label =
            typeof options.tabBarLabel === "function"
              ? options.tabBarLabel({
                  focused: isFocused,
                  color: iconColor,
                  position: "below-icon",
                  children: "",
                })
              : (options.tabBarLabel ?? route.name);

          const CART_ROUTE = "carrito";

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              ref={route.name === "carrito" ? cartRef : undefined}
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              className="flex-1 items-center justify-center"
              style={{ paddingVertical: 4 }}
            >
              <View style={{ position: "relative" }}>
                {icon}
                {route.name === CART_ROUTE && <CartBadge />}
              </View>
              <ThemedText
                className={`text-xs font-semibold ${
                  isFocused ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
