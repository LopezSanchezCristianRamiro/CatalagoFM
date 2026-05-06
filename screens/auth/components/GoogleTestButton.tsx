// screens/auth/components/GoogleTestButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useGoogleTest } from "../hooks/useGoogleTest";

export function GoogleTestButton() {
  const { idToken, error, signIn, request } = useGoogleTest();

  return (
    <TouchableOpacity
      onPress={signIn}
      disabled={!request}
      activeOpacity={0.8}
      className="w-full h-12 flex-row items-center justify-center gap-3 bg-white border border-border rounded-lg mt-2"
    >
      {!request ? (
        <ActivityIndicator size="small" color="#7C3AED" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <ThemedText className="font-semibold text-foreground">
            Probar Google Sign-In
          </ThemedText>
        </>
      )}
      {/* Mostrar resultado en consola o Toast, aquí opcional */}
    </TouchableOpacity>
  );
}
