// screens/auth/hooks/useGoogleAuth.native.ts
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../contexts/AuthContext";
import { httpClient } from "../../../http/httpClient";

interface GoogleAuthState {
  loading: boolean;
  showPhoneModal: boolean;
  googleData: { email: string; nombre: string; foto: string | null } | null;
}

export function useGoogleAuth() {
  const { login } = useAuth();
  const idTokenRef = useRef<string | null>(null);
  const [state, setState] = useState<GoogleAuthState>({
    loading: false,
    showPhoneModal: false,
    googleData: null,
  });

  const verifyTokenOnBackend = async (idToken: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await httpClient.post<{
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

      if (response.status === "success") {
        await login(response.token!);
        Toast.show({
          type: "success",
          text1: "Bienvenido",
          text2: response.message,
        });
        router.replace("/(tabs)/catalogo");
      } else if (response.status === "needs_phone") {
        setState({
          loading: false,
          showPhoneModal: true,
          googleData: response.google_data!,
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
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (idToken) {
          idTokenRef.current = idToken;
          verifyTokenOnBackend(idToken);
        } else {
          throw new Error(
            "El token de Google no fue recibido (webClientId no configurado correctamente).",
          );
        }
      } else if (response.type === "cancelled") {
        Toast.show({
          type: "error",
          text1: "Cancelado",
          text2: "Inicio de sesión cancelado.",
        });
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      let mensaje = "No se pudo iniciar sesión con Google.";
      if (isErrorWithCode(error)) {
        const errorCode = error.code;
        // Usamos strings directamente porque statusCodes no incluye DEVELOPER_ERROR
        if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          mensaje = "Google Play Services no disponibles o desactualizados.";
        } else if (errorCode === statusCodes.IN_PROGRESS) {
          mensaje = "Ya hay un inicio de sesión en progreso.";
        } else if (errorCode === "DEVELOPER_ERROR") {
          mensaje =
            "Error de configuración (DEVELOPER_ERROR). Verificá SHA-1, nombre de paquete y client ID en Google Cloud Console.";
        } else {
          mensaje = `Error (código: ${errorCode}).`;
        }
      }
      Toast.show({ type: "error", text1: "Error", text2: mensaje });
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const handlePhoneSubmit = useCallback(
    async (telefono: string) => {
      if (!idTokenRef.current) return;
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await httpClient.post<{
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

        if (response.status === "success") {
          await login(response.token!);
          Toast.show({
            type: "success",
            text1: "Registro exitoso",
            text2: response.message,
          });
          router.replace("/(tabs)/catalogo");
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
    requestReady: true,
  };
}
