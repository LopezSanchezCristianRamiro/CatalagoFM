import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Toaster } from "../components/Toaster";
import { AuthProvider } from "../contexts/AuthContext";

import { CartAnimationProvider } from "../screens/catalogo/components/CartAnimationContext";
import { FlyingBubble } from "../screens/catalogo/components/FlyingBubble";

import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "602641734404-vd69bd1kl2pdasrkf30930a968b7b2il.apps.googleusercontent.com",
    });
  }, []);

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