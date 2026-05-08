import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components/ThemedText";
import { httpClient } from "../../../http/httpClient";

type Usuario = {
  idUsuario: number;
  idRol: number;
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  correo?: string;
  email?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const roles = [
  { idRol: 2, label: "Cliente" },
  { idRol: 1, label: "Administrador" },
];

export default function AdministradoresModal({ visible, onClose }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);

      const response = await httpClient.getAuth<{ usuarios: Usuario[] }>(
        "/api/admin/usuarios"
      );

      setUsuarios(response.usuarios || []);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchUsuarios();
    }
  }, [visible]);

  const usuariosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const nombre = `${usuario.nombre || usuario.nombres || ""} ${
        usuario.apellido || usuario.apellidos || ""
      }`;
      const correo = usuario.correo || usuario.email || "";

      return (
        q === "" ||
        nombre.toLowerCase().includes(q) ||
        correo.toLowerCase().includes(q) ||
        String(usuario.idUsuario).includes(q)
      );
    });
  }, [usuarios, search]);

  const cambiarRol = async (idUsuario: number, idRol: number) => {
    try {
      setSavingId(idUsuario);

      await httpClient.putAuth(`/api/admin/usuarios/${idUsuario}/rol`, {
        idRol,
      });

      setUsuarios((prev) =>
        prev.map((usuario) =>
          usuario.idUsuario === idUsuario ? { ...usuario, idRol } : usuario
        )
      );

      Toast.show({
        type: "success",
        text1: "Rol actualizado correctamente",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "No se pudo cambiar el rol",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <View className="bg-white rounded-3xl w-full max-w-4xl max-h-[85%] overflow-hidden">
          <View className="px-6 py-5 border-b border-gray-100 flex-row items-center justify-between">
            <View>
              <ThemedText className="text-2xl font-bold text-[#050816]">
                Acceso de administradores
              </ThemedText>
              <ThemedText className="text-gray-500 mt-1">
                Cambia el rol de los usuarios registrados.
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#050816" />
            </Pressable>
          </View>

          <View className="px-6 py-4">
            <View className="bg-[#f7f1f1] rounded-2xl px-4 py-3 flex-row items-center gap-3">
              <Ionicons name="search-outline" size={20} color="#64748b" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre, correo o ID..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-[#050816] outline-none"
              />
            </View>
          </View>

          {loading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <ScrollView className="px-6 pb-6">
              {usuariosFiltrados.length === 0 ? (
                <View className="py-10">
                  <ThemedText className="text-center text-gray-500">
                    No se encontraron usuarios.
                  </ThemedText>
                </View>
              ) : (
                usuariosFiltrados.map((usuario) => {
                  const nombre = `${usuario.nombre || usuario.nombres || "Sin nombre"} ${
                    usuario.apellido || usuario.apellidos || ""
                  }`;
                  const correo = usuario.correo || usuario.email || "Sin correo";

                  return (
                    <View
                      key={usuario.idUsuario}
                      className="border border-gray-100 rounded-2xl p-4 mb-3 bg-white"
                    >
                      <View className="flex-row items-center justify-between gap-4">
                        <View className="flex-1">
                          <ThemedText className="text-lg font-bold text-[#050816]">
                            {nombre}
                          </ThemedText>
                          <ThemedText className="text-gray-500 mt-1">
                            {correo}
                          </ThemedText>
                          <ThemedText className="text-xs text-gray-400 mt-1">
                            ID usuario: {usuario.idUsuario}
                          </ThemedText>
                        </View>

                        <View className="flex-row gap-2 flex-wrap justify-end">
                          {roles.map((rol) => {
                            const activo = usuario.idRol === rol.idRol;
                            const saving = savingId === usuario.idUsuario;

                            return (
                              <Pressable
                                key={rol.idRol}
                                disabled={saving || activo}
                                onPress={() =>
                                  cambiarRol(usuario.idUsuario, rol.idRol)
                                }
                                className={
                                  activo
                                    ? "px-4 py-2 rounded-full bg-[#8b2cff]"
                                    : "px-4 py-2 rounded-full bg-gray-100 border border-gray-200"
                                }
                              >
                                <ThemedText
                                  className={
                                    activo
                                      ? "text-white font-bold"
                                      : "text-[#050816] font-semibold"
                                  }
                                >
                                  {saving ? "..." : rol.label}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}