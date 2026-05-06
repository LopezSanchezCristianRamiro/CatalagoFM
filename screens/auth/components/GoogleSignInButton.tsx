// screens/auth/components/GoogleSignInButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { GooglePhoneModal } from "./GooglePhoneModal";

export function GoogleSignInButton() {
  const {
    loading,
    showPhoneModal,
    googleData,
    startGoogleSignIn,
    handlePhoneSubmit,
    closePhoneModal,
    requestReady,
  } = useGoogleAuth();

  return (
    <>
      <TouchableOpacity
        onPress={startGoogleSignIn}
        disabled={!requestReady || loading}
        activeOpacity={0.8}
        className="w-full h-12 flex-row items-center justify-center gap-3 bg-white border border-border rounded-lg mt-2"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <ThemedText className="font-semibold text-foreground">
              Continuar con Google
            </ThemedText>
          </>
        )}
      </TouchableOpacity>

      {showPhoneModal && googleData && (
        <GooglePhoneModal
          googleData={googleData}
          loading={loading}
          onSubmit={handlePhoneSubmit}
          onCancel={closePhoneModal}
        />
      )}
    </>
  );
}
