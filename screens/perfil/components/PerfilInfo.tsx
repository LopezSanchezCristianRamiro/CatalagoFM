// screens/perfil/components/PerfilInfo.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import type { Usuario } from "../../../contexts/AuthContext";

interface PerfilInfoProps {
  user: Usuario;
  loggingOut: boolean;
  onEditTelefono: () => void;
  onLogout: () => void;
  compact?: boolean;
}

export function PerfilInfo({
  user,
  loggingOut,
  onEditTelefono,
  onLogout,
  compact = false,
}: PerfilInfoProps) {
  // Ajuste sutil del tamaño de avatar
  const avatarSize = compact ? 72 : 100;

  return (
    <View className="items-center w-full">
      {/* Avatar */}
      <View className={`mb-4 ${compact ? "" : "mt-4"}`}>
        {user.foto ? (
          <Image
            source={{ uri: user.foto }}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{ width: avatarSize, height: avatarSize }}
            className="bg-primary/10 rounded-full items-center justify-center border border-primary/20"
          >
            <ThemedText className="text-4xl font-extrabold text-primary">
              {user.nombres?.charAt(0)?.toUpperCase() ?? "U"}
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText
        className={`font-extrabold text-center mb-1 text-foreground ${compact ? "text-xl" : "text-2xl"}`}
      >
        {user.nombres}
      </ThemedText>
      <ThemedText className="text-sm font-medium text-muted-foreground text-center mb-6">
        @{user.nombreUsuario}
      </ThemedText>

      {/* Tarjeta de información suavizada */}
      <View className="bg-muted/30 rounded-2xl p-5 mb-6 w-full">
        <View className="flex-row justify-between py-2.5 border-b border-border/50">
          <ThemedText className="text-sm font-semibold text-foreground">
            Correo
          </ThemedText>
          <ThemedText
            className="text-sm text-muted-foreground"
            numberOfLines={1}
          >
            {user.correo}
          </ThemedText>
        </View>

        <View className="flex-row justify-between py-2.5 border-b border-border/50">
          <ThemedText className="text-sm font-semibold text-foreground">
            Rol
          </ThemedText>
          <ThemedText className="text-sm text-muted-foreground capitalize">
            {user.rol}
          </ThemedText>
        </View>

        <View className="flex-row justify-between items-center pt-3 pb-1">
          <ThemedText className="text-sm font-semibold text-foreground">
            Teléfono
          </ThemedText>
          <View className="flex-row items-center gap-2">
            <ThemedText className="text-sm text-muted-foreground">
              {user.telefono
                ? user.telefono.includes("|")
                  ? `+${user.telefono.split("|")[0]} ${user.telefono.split("|")[1]}`
                  : user.telefono
                : "No registrado"}
            </ThemedText>
            <TouchableOpacity
              onPress={onEditTelefono}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="bg-primary/10 rounded-full p-1.5"
            >
              <Ionicons name="pencil" size={14} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Botón cerrar sesión */}
      <TouchableOpacity
        className={`active:scale-95 transition-transform h-12 bg-primary rounded-xl items-center justify-center mb-2 w-full ${loggingOut ? "opacity-70" : ""}`}
        onPress={onLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View className="flex-row items-center">
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#FFFFFF"
              className="mr-2"
            />
            <ThemedText className="text-primary-foreground text-base font-bold ml-2">
              Cerrar sesión
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
