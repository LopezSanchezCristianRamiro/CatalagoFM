import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { BASE_URL } from "../../../http/httpClient";
import { getToken } from "../../../storage/secureStorage";

interface Props {
  fechaInicio: string;
  fechaFin: string;
}

function toApiDate(ddmmyyyy: string): string | null {
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split("/");
  if (!d || !m || !y) return null;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export default function ReporteButton({ fechaInicio, fechaFin }: Props) {
  const [descargando, setDescargando] = useState(false);
  const sinFechas = !fechaInicio || !fechaFin;

  const handleDescargar = async () => {
    if (sinFechas) {
      Toast.show({
        type: "error",
        text1: "Fechas requeridas",
        text2: "Selecciona una fecha de inicio y fin.",
      });
      return;
    }

    const inicio = toApiDate(fechaInicio)!;
    const fin = toApiDate(fechaFin)!;
    const urlEndpoint = `${BASE_URL}/api/admin/reportes`;

    setDescargando(true);
    try {
      const token = await getToken();
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          fechaInicio: inicio, 
          fechaFin: fin 
        })
      };

      const response = await fetch(urlEndpoint, requestOptions);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const blob = await response.blob();

      if (Platform.OS === "web") {
        // ─── DESCARGA EN WEB (Ignora downloadAsync) ──────────────────────────
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `reporte_${inicio}_${fin}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);

      } else {
        // ─── DESCARGA EN MÓVIL (iOS / Android) ───────────────────────
        const fileUri = FileSystem.documentDirectory + `reporte_${inicio}_${fin}.pdf`;
        
        const reader = new FileReader();
        reader.onload = async () => {
          const base64data = (reader.result as string).split(',')[1];
          
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Reporte de ventas",
            UTI: "com.adobe.pdf",
          });

          FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        };
        
        reader.readAsDataURL(blob);
      }

      Toast.show({
        type: "success",
        text1: "Reporte generado",
        text2: `Del ${fechaInicio} al ${fechaFin}`,
      });

    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo generar el reporte",
        text2: e.message ?? "Intenta de nuevo.",
      });
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Pressable
      onPress={handleDescargar}
      disabled={descargando}
      style={({ pressed }) => ({
        marginTop: 10,
        borderRadius: 14,
        opacity: pressed || descargando ? 0.8 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: sinFechas ? "#A78BFA" : "#7C3AED",
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 13,
          paddingHorizontal: 16,
          borderRadius: 14,
          gap: 12,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: 7,
          }}
        >
          <Ionicons name="document-text-outline" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{ color: "#fff", fontWeight: "700", fontSize: 14, lineHeight: 18 }}
          >
            Exportar reporte PDF
          </ThemedText>
          <ThemedText
            style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1 }}
          >
            {sinFechas
              ? "Selecciona un rango de fechas"
              : `${fechaInicio}  →  ${fechaFin}`}
          </ThemedText>
        </View>
        {descargando ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name="cloud-download-outline"
            size={20}
            color="rgba(255,255,255,0.8)"
          />
        )}
      </View>
    </Pressable>
  );
}