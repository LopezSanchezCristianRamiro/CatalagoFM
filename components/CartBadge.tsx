// components/CartBadge.tsx
import { useEffect, useRef } from "react";
import { Animated, Platform, Text } from "react-native";
import { useCartStore } from "../store/cartStore";

export function CartBadge() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((acc, i) => acc + i.cantidad, 0);

  const scale = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(total);

  useEffect(() => {
    if (total !== prevCount.current) {
      prevCount.current = total;
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.6,
          useNativeDriver: Platform.OS !== "web", 
          speed: 50,
          bounciness: 12,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: Platform.OS !== "web", 
          speed: 20,
          bounciness: 6,
        }),
      ]).start();
    }
  }, [total]);

  if (total === 0) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -4,
        right: -6,
        transform: [{ scale }],
        backgroundColor: "#7C3AED",
        borderRadius: 999,
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: "white",
        zIndex: 10,
      }}
    >
      <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
        {total > 99 ? "99+" : total}
      </Text>
    </Animated.View>
  );
}