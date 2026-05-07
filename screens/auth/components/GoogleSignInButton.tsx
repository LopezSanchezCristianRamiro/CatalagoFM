// screens/auth/components/GoogleSignInButton.tsx
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import googleLogo from "../../../assets/images/google-logo.png";
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
        className="w-full h-12 flex-row items-center justify-center gap-3 bg-white border border-border rounded-lg"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#7C3AED" />
        ) : (
          <>
            <Image
              source={googleLogo}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
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
