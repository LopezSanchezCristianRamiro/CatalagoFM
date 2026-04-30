import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "../components/Toaster";
import { AuthProvider } from "../contexts/AuthContext";
import { CartAnimationProvider } from "../screens/catalogo/components/CartAnimationContext";
import { FlyingBubble } from "../screens/catalogo/components/FlyingBubble";

import "../global.css";

export default function RootLayout() {
  return (
    <CartAnimationProvider>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" backgroundColor="#FAFAFE" />
          <Stack screenOptions={{ headerShown: false }} />
          <Toaster />
        </GestureHandlerRootView>
      </AuthProvider>
      <FlyingBubble />
    </CartAnimationProvider>
  );
}
