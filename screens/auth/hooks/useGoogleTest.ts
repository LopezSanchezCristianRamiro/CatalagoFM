// screens/auth/hooks/useGoogleTest.ts
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

// Completa la sesión web si se abrió desde el navegador
WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID =
  "602641734404-f9lfco0u2rfs33mignbe2q9jb4ff0lu0.apps.googleusercontent.com";
const WEB_CLIENT_ID =
  "602641734404-9mifa360nnavbalbflnvmm6btinbt6bp.apps.googleusercontent.com";

// Redirect URI que funciona en Android, iOS y Web sin proxy
const redirectUri = AuthSession.makeRedirectUri({
  scheme: "com.catalogofm",
});

export function useGoogleTest() {
  const [idToken, setIdToken] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    responseType: "id_token",
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.params.id_token;
      if (token) {
        setIdToken(token);
        console.log("✅ idToken obtenido:", token);
        Toast.show({
          type: "success",
          text1: "Google Sign-In exitoso",
          text2: "Token recibido. Revisa la consola.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se recibió id_token de Google.",
        });
      }
    } else if (response?.type === "error") {
      Toast.show({
        type: "error",
        text1: "Autenticación cancelada",
        text2: response.error?.message || "Inténtalo de nuevo.",
      });
    }
  }, [response]);

  const signIn = async () => {
    try {
      await promptAsync({
        windowFeatures: { width: 600, height: 700 },
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error inesperado",
        text2: err.message,
      });
    }
  };

  return {
    idToken,
    signIn,
    request, // indica si el hook está listo para autenticar
  };
}
