import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  return (
    <View
      className="flex-row bg-white border-t border-border"
      style={{
        paddingBottom: insets.bottom + 5,
        paddingTop: 5,
        height: 60 + insets.bottom,
      }}
    >
      {filteredRoutes.map((route, index) => {
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

        const color = isFocused ? "#000000" : "#71717A";
        const iconName = options.tabBarIcon
          ? (options.tabBarIcon as any)({ color, size: 24 })
          : null;

        // Obtener la etiqueta como cadena
        const label =
          typeof options.tabBarLabel === "function"
            ? options.tabBarLabel({
                focused: isFocused,
                color,
                position: "below-icon",
                children: "",
              })
            : (options.tabBarLabel ?? route.name);

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            className="flex-1 items-center justify-center"
            style={{ paddingVertical: 4 }}
          >
            {iconName}
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
