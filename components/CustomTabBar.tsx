// components/CustomTabBar.tsx
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

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

          const icon = options.tabBarIcon
            ? (options.tabBarIcon as any)({ color: iconColor, size: 24 })
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
