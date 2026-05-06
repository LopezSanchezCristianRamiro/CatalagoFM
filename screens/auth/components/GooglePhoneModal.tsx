// screens/auth/components/GooglePhoneModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import { ThemedText } from "../../../components/ThemedText";

interface GooglePhoneModalProps {
  googleData: { email: string; nombre: string; foto: string | null };
  loading: boolean;
  onSubmit: (telefono: string) => void;
  onCancel: () => void;
}

export function GooglePhoneModal({
  googleData,
  loading,
  onSubmit,
  onCancel,
}: GooglePhoneModalProps) {
  const [countryCode, setCountryCode] = useState("591"); // Bolivia por defecto
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);

  const fullPhoneNumber = `${countryCode}${phoneNumber.trim()}`;

  const handleSubmit = () => {
    const clean = phoneNumber.trim();
    if (clean && /^\d{7,}$/.test(clean)) {
      onSubmit(fullPhoneNumber);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-card rounded-xl p-6 w-full max-w-md shadow-sharp">
          {/* Encabezado */}
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText className="text-lg font-bold text-card-foreground">
              Completar registro
            </ThemedText>
            <TouchableOpacity onPress={onCancel} disabled={loading}>
              <Ionicons name="close" size={24} color="#71717A" />
            </TouchableOpacity>
          </View>

          <ThemedText className="text-sm text-muted-foreground mb-6">
            Hola {googleData.nombre}, necesitamos tu número de teléfono para
            terminar.
          </ThemedText>

          {/* ───── Sección Teléfono (fila) ───── */}
          <ThemedText className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest ml-1">
            Teléfono
          </ThemedText>
          <View className="flex-row items-start mb-6">
            {/* Selector de prefijo */}
            <TouchableOpacity
              onPress={() => {
                setPickerKey((prev) => prev + 1);
                setPickerVisible(true);
              }}
              className="flex-row items-center bg-background border border-border rounded-xl px-4 py-3 mr-2"
              accessibilityRole="button"
              accessibilityLabel={`Prefijo +${countryCode}`}
            >
              <ThemedText className="text-foreground font-semibold text-base">
                +{countryCode}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={14}
                color="#9CA3AF"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            {/* Número local */}
            <View className="flex-1">
              <TextInput
                className="bg-background p-3 rounded-xl border border-border text-foreground text-base font-medium"
                placeholder="Número de celular"
                placeholderTextColor="#A1A1AA"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!loading}
                maxLength={15}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>

          {/* Botón de envío */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !/^\d{5,}$/.test(phoneNumber.trim())}
            activeOpacity={0.8}
            className={`h-12 bg-primary rounded-lg items-center justify-center ${
              loading || !/^\d{5,}$/.test(phoneNumber.trim())
                ? "opacity-60"
                : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText className="text-primary-foreground font-semibold">
                Continuar
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ───── CountryPicker (modal independiente) ───── */}
      <CountryPicker
        key={pickerKey}
        show={pickerVisible}
        pickerButtonOnPress={(item) => {
          const cleanCode = item.dial_code.replace("+", "");
          setCountryCode(cleanCode);
          setPickerVisible(false);
        }}
        onBackdropPress={() => setPickerVisible(false)}
        lang="es"
        initialState={""}
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
            backgroundColor: "#F5F3FF", // secondary del tema
            fontFamily: "Plus Jakarta Sans",
            color: "#1E1B4B",
          },
          countryName: {
            fontFamily: "Plus Jakarta Sans",
          },
          dialCode: {
            fontFamily: "Plus Jakarta Sans",
            fontWeight: "700",
          },
          flag: {
            fontFamily: Platform.OS === "web" ? "system-ui" : undefined,
            fontSize: 20,
          },
          countryButtonStyles: {
            height: 56,
            paddingHorizontal: 16,
          },
        }}
      />
    </Modal>
  );
}
