// screens/auth/hooks/useGoogleAuth.web.ts
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../contexts/AuthContext";
import { httpClient } from "../../../http/httpClient";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  "602641734404-9mifa360nnavbalbflnvmm6btinbt6bp.apps.googleusercontent.com";

const redirectUri = AuthSession.makeRedirectUri(); // en web devolverá http://localhost:8081 o el de producción

interface GoogleAuthState {
  loading: boolean;
  showPhoneModal: boolean;
  googleData: { email: string; nombre: string; foto: string | null } | null;
}

export function useGoogleAuth() {
  const { login } = useAuth();
  const router = useRouter();
  const idTokenRef = useRef<string | null>(null);
  const [state, setState] = useState<GoogleAuthState>({
    loading: false,
    showPhoneModal: false,
    googleData: null,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    responseType: "id_token",
    redirectUri,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params.id_token;
      if (idToken) {
        idTokenRef.current = idToken;
        verifyTokenOnBackend(idToken);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se recibió id_token.",
        });
        setState((prev) => ({ ...prev, loading: false }));
      }
    } else if (response?.type === "error") {
      Toast.show({
        type: "error",
        text1: "Autenticación cancelada",
        text2: response.error?.message,
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [response]);

  const verifyTokenOnBackend = async (idToken: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const backendResponse = await httpClient.post<{
        status: "success" | "needs_phone";
        message: string;
        token?: string;
        user?: any;
        google_data?: { email: string; nombre: string; foto: string | null };
      }>(
        "/api/auth/google",
        { id_token: idToken },
        "Error al verificar con Google",
      );

      if (backendResponse.status === "success") {
        await login(backendResponse.token!);
        Toast.show({
          type: "success",
          text1: "Bienvenido",
          text2: backendResponse.message,
        });
        router.replace("/(tabs)/catalogo");
      } else if (backendResponse.status === "needs_phone") {
        setState({
          loading: false,
          showPhoneModal: true,
          googleData: backendResponse.google_data!,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Error al verificar la cuenta.",
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const startGoogleSignIn = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      showPhoneModal: false,
      googleData: null,
    }));
    try {
      await promptAsync();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo iniciar la autenticación.",
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [promptAsync]);

  const handlePhoneSubmit = useCallback(
    async (telefono: string) => {
      if (!idTokenRef.current) return;
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const backendResponse = await httpClient.post<{
          status: string;
          message: string;
          token?: string;
          user?: any;
        }>(
          "/api/auth/google/register",
          {
            id_token: idTokenRef.current,
            telefono,
          },
          "Error al completar registro",
        );

        if (backendResponse.status === "success") {
          await login(backendResponse.token!);
          Toast.show({
            type: "success",
            text1: "Registro exitoso",
            text2: backendResponse.message,
          });
          router.replace("/(tabs)/catalogo");
        } else {
          throw new Error(backendResponse.message || "Error al registrar");
        }
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "No se pudo completar el registro",
        });
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [login],
  );

  const closePhoneModal = useCallback(() => {
    setState((prev) => ({ ...prev, showPhoneModal: false }));
  }, []);

  return {
    loading: state.loading,
    showPhoneModal: state.showPhoneModal,
    googleData: state.googleData,
    startGoogleSignIn,
    handlePhoneSubmit,
    closePhoneModal,
    requestReady: !!request,
  };
}
