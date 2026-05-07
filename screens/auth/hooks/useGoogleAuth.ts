// screens/auth/hooks/useGoogleAuth.ts
import { Platform } from "react-native";
import { useGoogleAuth as useGoogleAuthNative } from "./useGoogleAuth.native";
import { useGoogleAuth as useGoogleAuthWeb } from "./useGoogleAuth.web";

export const useGoogleAuth =
  Platform.OS === "web" ? useGoogleAuthWeb : useGoogleAuthNative;
