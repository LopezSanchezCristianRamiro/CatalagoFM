// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Toaster } from "../components/Toaster";
import { AuthProvider } from "../contexts/AuthContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor="#FAFAFE" />
      <Stack screenOptions={{ headerShown: false }} />
      <Toaster />
    </AuthProvider>
  );
}
