import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";

interface Props {
  visible: boolean;
  telefonoActual: string;
  onClose: () => void;
  onConfirm: (nuevoTelefono: string) => void;
  saving: boolean;
}

// ── Prefijos ordenados de mayor a menor longitud ──────────────────────────────
const DIAL_CODES = [
  "1684","1264","1268","1242","1246","1441","1284","1345","1767","1809",
  "1829","1849","1473","1671","1876","1664","1670","1868","1649","1340",
  "1758","1784","1869","1721","1767",
  "599","598","597","596","595","594","593","592","591","590",
  "386","385","383","382","381","380","374","373","372","371","370",
  "358","357","356","354","353","352","351","350",
  "269","268","267","266","265","264","263","262","261","260",
  "998","996","994","993","992","977","976","975","974","973","972",
  "971","970","968","967","966","965","964","963","962","961","960",
  "886","880","856","855","853","852","850",
  "66","65","64","63","62","61","60",
  "55","54","53","52","51","49","48","47","46","45","44","43","41",
  "40","39","36","34","33","32","31","30","27","20",
  "7","1",
];

function parsePhone(raw: string): { code: string; num: string } {
  if (!raw) return { code: "591", num: "" };

  // Formato nuevo con separador  →  "591|79990071"
  if (raw.includes("|")) {
    const [code, num] = raw.split("|");
    return { code, num };
  }

  // Formato viejo sin separador  →  "59179990071"
  // Intentar detectar el prefijo comparando contra lista conocida
  for (const code of DIAL_CODES) {
    if (raw.startsWith(code)) {
      const num = raw.slice(code.length);
      // El número restante debe tener entre 6 y 12 dígitos para ser válido
      if (num.length >= 6 && num.length <= 12) {
        return { code, num };
      }
    }
  }

  // No se detectó prefijo → mostrar número completo, Bolivia por defecto
  return { code: "591", num: raw };
}

export function EditarTelefonoModal({
  visible,
  telefonoActual,
  onClose,
  onConfirm,
  saving,
}: Props) {
  // ── Inicializar estado parseando el teléfono actual ───────────────────────
  const parsedInicial = parsePhone(telefonoActual);
  const [telefono, setTelefono] = useState(parsedInicial.num);
  const [countryCode, setCountryCode] = useState(parsedInicial.code);

  const [confirmando, setConfirmando] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);

  const fullPhone = `${countryCode}|${telefono.trim()}`;

  const handleClose = () => {
    setConfirmando(false);
    // Resetear al valor actual también parseado correctamente
    const p = parsePhone(telefonoActual);
    setTelefono(p.num);
    setCountryCode(p.code);
    setPickerKey((prev) => prev + 1);
    onClose();
  };

  const handleSiguiente = () => {
    if (!telefono.trim()) {
      Toast.show({ type: "error", text1: "El teléfono no puede estar vacío" });
      return;
    }
    setConfirmando(true);
  };

  const handleConfirmar = () => {
    onConfirm(fullPhone);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>

          {!confirmando ? (
            // ── Paso 1: Ingresar número ──────────────────────────────
            <>
              <View style={styles.header}>
                <Ionicons name="call-outline" size={22} color="#7C3AED" />
                <ThemedText style={styles.title}>Editar teléfono</ThemedText>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.subtitle}>
                Ingresa tu nuevo número de teléfono
              </ThemedText>

              {/* Selector de país + número */}
              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => {
                    setPickerKey((prev) => prev + 1);
                    setPickerVisible(true);
                  }}
                  style={styles.countryBtn}
                >
                  <ThemedText style={styles.countryCode}>+{countryCode}</ThemedText>
                  <Ionicons name="chevron-down" size={14} color="#9CA3AF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="Ej: 70012345"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.btnCancel} onPress={handleClose}>
                  <ThemedText style={styles.btnCancelText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSave} onPress={handleSiguiente}>
                  <ThemedText style={styles.btnSaveText}>Siguiente</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // ── Paso 2: Confirmar cambio ─────────────────────────────
            <>
              <View style={styles.warningIcon}>
                <Ionicons name="warning-outline" size={40} color="#F59E0B" />
              </View>

              <ThemedText style={styles.warningTitle}>
                ¿Confirmar cambio?
              </ThemedText>

              <ThemedText style={styles.warningBody}>
                Tu número actual será reemplazado por:
              </ThemedText>

              <View style={styles.telefonoBox}>
                <ThemedText style={styles.telefonoNuevo}>
                  +{countryCode} {telefono}
                </ThemedText>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => setConfirmando(false)}
                  disabled={saving}
                >
                  <ThemedText style={styles.btnCancelText}>Volver</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnSave, saving && styles.btnDisabled]}
                  onPress={handleConfirmar}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <ThemedText style={styles.btnSaveText}>Confirmar</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </View>
      <CountryPicker
        key={pickerKey}
        show={pickerVisible}
        pickerButtonOnPress={(item) => {
          setCountryCode(item.dial_code.replace("+", ""));
          setPickerVisible(false);
        }}
        onBackdropPress={() => setPickerVisible(false)}
        lang="es"
        initialState=""
        inputPlaceholder="Buscar país..."
        style={{
          modal: {
            height: 450,
            width: "100%",
            maxWidth: 500,
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            alignSelf: "center",
          },
          textInput: {
            height: 50,
            borderRadius: 12,
            paddingHorizontal: 16,
            backgroundColor: "#F5F3FF",
          },
          countryButtonStyles: { height: 56, paddingHorizontal: 16 },
          flag: {
            fontSize: 20,
            fontFamily: Platform.OS === "web" ? "system-ui" : undefined,
          },
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "700", flex: 1, marginLeft: 8, color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  actions: { flexDirection: "row", gap: 12 },
  btnCancel: {
    flex: 1, height: 44, borderRadius: 10,
    borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  btnCancelText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  btnSave: {
    flex: 1, height: 44, borderRadius: 10,
    backgroundColor: "#7C3AED",
    alignItems: "center", justifyContent: "center",
  },
  btnSaveText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  btnDisabled: { opacity: 0.65 },
  // ── Paso confirmación ──
  warningIcon: { alignItems: "center", marginBottom: 12 },
  warningTitle: {
    fontSize: 18, fontWeight: "700", color: "#111827",
    textAlign: "center", marginBottom: 8,
  },
  warningBody: {
    fontSize: 13, color: "#6B7280",
    textAlign: "center", marginBottom: 16,
  },
  telefonoBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  telefonoNuevo: {
    fontSize: 20, fontWeight: "700", color: "#7C3AED", letterSpacing: 1,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    marginRight: 8,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
});