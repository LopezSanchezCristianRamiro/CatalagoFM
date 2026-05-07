// app/google-callback.tsx
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { View } from "react-native";

// Completa la sesión y cierra el popup (si es una ventana emergente)
WebBrowser.maybeCompleteAuthSession();

export default function GoogleCallbackScreen() {
  useEffect(() => {
    // En web, si estamos en un popup, lo cerramos inmediatamente
    if (typeof window !== "undefined" && window.opener) {
      // El cierre se realiza automáticamente después de maybeCompleteAuthSession,
      // pero podemos forzarlo después de un breve instante para evitar que el router navegue.
      setTimeout(() => {
        window.close();
      }, 100);
    }
  }, []);

  return <View style={{ flex: 1, backgroundColor: "transparent" }} />;
}
