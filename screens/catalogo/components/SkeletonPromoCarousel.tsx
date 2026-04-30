// screens/catalogo/components/SkeletonPromoCarousel.tsx
import React from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { Shimmer } from "./Shimmer";

const CAROUSEL_HEIGHT_MOBILE = 520;
const CAROUSEL_HEIGHT_DESKTOP = 500;

export function SkeletonPromoCarousel() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const height = isDesktop ? CAROUSEL_HEIGHT_DESKTOP : CAROUSEL_HEIGHT_MOBILE;

  return (
    <View
      style={{
        width: "100%",
        height,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Shimmer
        width={isDesktop ? width * 0.82 : width}
        height={height}
        borderRadius={isDesktop ? 32 : 0}
      />
    </View>
  );
}
