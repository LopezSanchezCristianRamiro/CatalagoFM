// screens/auth/RecoverEmailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../components/ThemedText";
import { httpClient } from "../../http/httpClient";

type Step = 1 | 2 | 3;

export default function RecoverEmailScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const codigoValido = codigo.trim().length === 6;
  const passwordValida = password.length >= 6;
  const passwordsCoinciden = password === passwordConfirm;

  const formPasswordValido =
    passwordValida && passwordsCoinciden && passwordConfirm.length > 0 && !loading;

  const enviarCodigo = async () => {
    if (!emailValido) {
      Toast.show({
        type: "error",
        text1: "Correo inválido",
        text2: "Ingresa un correo válido",
      });
      return;
    }

    setLoading(true);

    try {
      await httpClient.post(
        "/api/password/forgot-email",
        { email: email.trim() },
        "Error al enviar código"
      );

      Toast.show({
        type: "success",
        text1: "Solicitud enviada",
        text2:
          "Si el correo está asociado a una cuenta, se enviará un código",
      });

      setStep(2);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message ?? "No se pudo enviar el código",
      });
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async () => {
    if (!codigoValido) {
      Toast.show({
        type: "error",
        text1: "Código inválido",
        text2: "Ingresa el código de 6 dígitos",
      });
      return;
    }

    setLoading(true);

    try {
      await httpClient.post(
        "/api/password/verify-code",
        {
          email: email.trim(),
          code: codigo.trim(),
        },
        "Código incorrecto"
      );

      Toast.show({
        type: "success",
        text1: "Código verificado",
        text2: "Ahora crea tu nueva contraseña",
      });

      setStep(3);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message ?? "Código incorrecto o expirado",
      });
    } finally {
      setLoading(false);
    }
  };

  const cambiarPassword = async () => {
    if (!formPasswordValido) return;

    setLoading(true);

    try {
      await httpClient.post(
        "/api/password/reset",
        {
          email: email.trim(),
          code: codigo.trim(),
          password,
          password_confirmation: passwordConfirm,
        },
        "No se pudo cambiar la contraseña"
      );

      Toast.show({
        type: "success",
        text1: "Contraseña actualizada",
        text2: "Ya puedes iniciar sesión",
      });

      router.replace("/login");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message ?? "No se pudo cambiar la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  const titulo =
    step === 1
      ? "Recuperar por correo"
      : step === 2
      ? "Verificar código"
      : "Nueva contraseña";

  const subtitulo =
    step === 1
      ? "Ingresa tu correo y te enviaremos un código."
      : step === 2
      ? `Ingresa el código enviado a ${email}.`
      : "Crea una nueva contraseña para tu cuenta.";

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        <TouchableOpacity
          onPress={() => {
            if (step > 1) {
              setStep((prev) => (prev - 1) as Step);
            } else {
              router.back();
            }
          }}
          className="absolute top-12 left-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80"
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color="#1E1B4B" />
        </TouchableOpacity>

        <View className="flex-1 justify-center items-center px-8 pt-20 pb-10">
          <View className="w-full max-w-md">
            <View className="mb-8">
              <ThemedText className="text-3xl font-bold mb-2">
                {titulo}
              </ThemedText>

              <ThemedText className="text-base text-muted-foreground">
                {subtitulo}
              </ThemedText>
            </View>

            <View className="flex-row items-center mb-8">
              {[1, 2, 3].map((item) => (
                <View key={item} className="flex-1 flex-row items-center">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      step >= item
                        ? "bg-primary"
                        : "bg-white border border-border"
                    }`}
                  >
                    <ThemedText
                      className={`font-bold ${
                        step >= item
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item}
                    </ThemedText>
                  </View>

                  {item < 3 && (
                    <View
                      className={`flex-1 h-1 mx-2 rounded-full ${
                        step > item ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </View>
              ))}
            </View>

            {step === 1 && (
              <>
                <View className="mb-6">
                  <ThemedText className="text-sm font-medium mb-2">
                    Correo electrónico
                  </ThemedText>

                  <TextInput
                    className="w-full h-12 bg-white border border-border rounded-lg px-4 text-foreground"
                    placeholder="ejemplo@gmail.com"
                    placeholderTextColor="#A1A1AA"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    onSubmitEditing={enviarCodigo}
                  />

                  {email.length > 0 && !emailValido && (
                    <ThemedText className="text-red-500 text-xs mt-1">
                      Ingresa un correo válido.
                    </ThemedText>
                  )}
                </View>

                <TouchableOpacity
                  onPress={enviarCodigo}
                  disabled={loading || !emailValido}
                  activeOpacity={0.8}
                  className={`h-12 rounded-lg items-center justify-center ${
                    loading || !emailValido ? "bg-gray-300" : "bg-primary"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText className="text-white font-semibold">
                      Enviar código
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <View className="mb-6">
                  <ThemedText className="text-sm font-medium mb-2">
                    Código de verificación
                  </ThemedText>

                  <TextInput
                    className="w-full h-12 bg-white border border-border rounded-lg px-4 text-foreground text-center text-xl font-bold tracking-widest"
                    placeholder="000000"
                    placeholderTextColor="#A1A1AA"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={codigo}
                    onChangeText={setCodigo}
                    editable={!loading}
                    onSubmitEditing={verificarCodigo}
                  />

                  {codigo.length > 0 && !codigoValido && (
                    <ThemedText className="text-red-500 text-xs mt-1">
                      El código debe tener 6 dígitos.
                    </ThemedText>
                  )}
                </View>

                <TouchableOpacity
                  onPress={verificarCodigo}
                  disabled={loading || !codigoValido}
                  activeOpacity={0.8}
                  className={`h-12 rounded-lg items-center justify-center ${
                    loading || !codigoValido ? "bg-gray-300" : "bg-primary"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText className="text-white font-semibold">
                      Verificar código
                    </ThemedText>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={enviarCodigo}
                  disabled={loading}
                  className="mt-5 items-center"
                >
                  <ThemedText className="text-sm font-semibold text-accent">
                    Reenviar código
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <View className="mb-5">
                  <ThemedText className="text-sm font-medium mb-2">
                    Nueva contraseña
                  </ThemedText>

                  <View className="relative">
                    <TextInput
                      className="w-full h-12 bg-white border border-border rounded-lg px-4 pr-12 text-foreground"
                      placeholder="Nueva contraseña"
                      placeholderTextColor="#A1A1AA"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      editable={!loading}
                    />

                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-0 h-12 justify-center"
                      disabled={loading}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#71717A"
                      />
                    </TouchableOpacity>
                  </View>

                  {password.length > 0 && !passwordValida && (
                    <ThemedText className="text-red-500 text-xs mt-1">
                      Debe tener al menos 6 caracteres.
                    </ThemedText>
                  )}
                </View>

                <View className="mb-6">
                  <ThemedText className="text-sm font-medium mb-2">
                    Confirmar contraseña
                  </ThemedText>

                  <View className="relative">
                    <TextInput
                      className="w-full h-12 bg-white border border-border rounded-lg px-4 pr-12 text-foreground"
                      placeholder="Repite la contraseña"
                      placeholderTextColor="#A1A1AA"
                      secureTextEntry={!showPasswordConfirm}
                      value={passwordConfirm}
                      onChangeText={setPasswordConfirm}
                      editable={!loading}
                      onSubmitEditing={cambiarPassword}
                    />

                    <TouchableOpacity
                      onPress={() => setShowPasswordConfirm((prev) => !prev)}
                      className="absolute right-3 top-0 h-12 justify-center"
                      disabled={loading}
                    >
                      <Ionicons
                        name={
                          showPasswordConfirm
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={22}
                        color="#71717A"
                      />
                    </TouchableOpacity>
                  </View>

                  {passwordConfirm.length > 0 && !passwordsCoinciden && (
                    <ThemedText className="text-red-500 text-xs mt-1">
                      Las contraseñas no coinciden.
                    </ThemedText>
                  )}
                </View>

                <TouchableOpacity
                  onPress={cambiarPassword}
                  disabled={!formPasswordValido}
                  activeOpacity={0.8}
                  className={`h-12 rounded-lg items-center justify-center ${
                    formPasswordValido ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText className="text-white font-semibold">
                      Cambiar contraseña
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              className="mt-6 items-center"
              disabled={loading}
            >
              <ThemedText className="text-sm text-muted-foreground">
                Volver al login
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}