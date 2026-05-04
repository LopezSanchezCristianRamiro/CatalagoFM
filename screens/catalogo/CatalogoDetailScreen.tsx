// screens/catalogo/CatalogoDetailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { useResponsive } from "../../hooks/useResponsive";
import { MobileDetailLayout } from "./components/MobileDetailLayout";
import { Shimmer } from "./components/Shimmer";
import { WebDetailLayout } from "./components/WebDetailLayout";
import { useCatalogoDetail } from "./hooks/useCatalogoDetail";



export default function CatalogoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const idProducto = Number(id);
  const insets = useSafeAreaInsets();
  const { producto, loading, error } = useCatalogoDetail(idProducto);
  const isWeb = useResponsive().isDesktop;

  // Redirigir si el producto fue desactivado
  React.useEffect(() => {
    if (producto?.estado === "desactivado") {
      Toast.show({
        type: "error",
        text1: "Producto no disponible",
        text2: "Este producto fue desactivado.",
        visibilityTime: 3000,
      });
      router.replace("/catalogo");
    }
  }, [producto, router]);

  // ── Loading ────────────────────────────────────
  if (loading) {
    if (isWeb) {
      return (
        <View style={{ flex: 1, backgroundColor: "#FAFAFE", justifyContent: "center", alignItems: "center", paddingTop: insets.top }}>
          <View style={{ width: "100%", maxWidth: 1024, flexDirection: "row", gap: 20, padding: 20 }}>
            <View style={{ width: "50%" }}>
              <Shimmer width="100%" height={400} borderRadius={24} />
            </View>
            <View style={{ width: "50%", justifyContent: "center" }}>
              <Shimmer width={100} height={20} borderRadius={12} />
              <View style={{ height: 8 }} />
              <Shimmer width="70%" height={28} borderRadius={8} />
              <View style={{ height: 8 }} />
              <Shimmer width="100%" height={16} borderRadius={8} />
              <View style={{ height: 4 }} />
              <Shimmer width="80%" height={16} borderRadius={8} />
              <View style={{ height: 16 }} />
              <Shimmer width={120} height={36} borderRadius={8} />
              <View style={{ height: 24 }} />
              <Shimmer width={150} height={20} borderRadius={8} />
              <View style={{ height: 12 }} />
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ flexDirection: "row", marginBottom: 12 }}>
                  <Shimmer width={40} height={40} borderRadius={12} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Shimmer width="60%" height={14} borderRadius={6} />
                    <View style={{ height: 4 }} />
                    <Shimmer width="80%" height={12} borderRadius={6} />
                  </View>
                </View>
              ))}
              <Shimmer width="100%" height={56} borderRadius={16} />
            </View>
          </View>
        </View>
      );
    }
    // Mobile loading (mantenido del original)
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", paddingTop: insets.top }}>
        <View style={{ width: "100%", maxWidth: 768 }}>
          <Shimmer width="100%" height={300} borderRadius={0} />
          <View style={{ padding: 20 }}>
            <Shimmer width={100} height={20} borderRadius={12} />
            <View style={{ height: 8 }} />
            <Shimmer width="70%" height={28} borderRadius={8} />
            <View style={{ height: 8 }} />
            <Shimmer width="100%" height={16} borderRadius={8} />
            <View style={{ height: 4 }} />
            <Shimmer width="80%" height={16} borderRadius={8} />
            <View style={{ height: 16 }} />
            <Shimmer width={120} height={36} borderRadius={8} />
            <View style={{ height: 24 }} />
            <Shimmer width={150} height={20} borderRadius={8} />
            <View style={{ height: 12 }} />
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 12 }}>
                <Shimmer width={40} height={40} borderRadius={12} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Shimmer width="60%" height={14} borderRadius={6} />
                  <View style={{ height: 4 }} />
                  <Shimmer width="80%" height={12} borderRadius={6} />
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: insets.bottom + 10, paddingHorizontal: 20, paddingTop: 10, backgroundColor: "rgba(255,255,255,0.95)", borderTopWidth: 0.5, borderTopColor: "#E5E7EB", alignItems: "center" }}>
          <Shimmer width="100%" height={56} borderRadius={16} />
        </View>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────
  if (error || !producto) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", padding: 20, paddingTop: insets.top }}>
        <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
        <ThemedText className="text-status-error font-bold text-lg text-center mt-4">
          {error ?? "Producto no encontrado"}
        </ThemedText>
        <Pressable onPress={() => router.back()} className="bg-primary px-8 py-3 rounded-xl mt-6 active:scale-95">
          <ThemedText className="text-white font-semibold">Volver</ThemedText>
        </Pressable>
      </Animated.View>
    );
  }

  // ── Layout según plataforma ───────────────────
  if (isWeb) {
    return <WebDetailLayout producto={producto} insets={insets} />;
  }
  return <MobileDetailLayout producto={producto} insets={insets} />;
}