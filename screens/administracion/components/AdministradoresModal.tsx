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

type Rol = {
  idRol: number;
  label: string;
};

type CambioPendiente = {
  usuario: Usuario;
  rol: Rol;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const roles: Rol[] = [
  { idRol: 2, label: "Cliente" },
  { idRol: 1, label: "Administrador" },
];

function getNombreUsuario(usuario: Usuario) {
  return `${usuario.nombre || usuario.nombres || "Sin nombre"} ${
    usuario.apellido || usuario.apellidos || ""
  }`.trim();
}

function getRolLabel(idRol: number) {
  return roles.find((rol) => rol.idRol === Number(idRol))?.label || "Sin rol";
}

export default function AdministradoresModal({ visible, onClose }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [cambioPendiente, setCambioPendiente] =
    useState<CambioPendiente | null>(null);

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
    } else {
      setSearch("");
      setCambioPendiente(null);
    }
  }, [visible]);

  const usuariosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const nombre = getNombreUsuario(usuario);
      const correo = usuario.correo || usuario.email || "";

      return (
        q === "" ||
        nombre.toLowerCase().includes(q) ||
        correo.toLowerCase().includes(q) ||
        String(usuario.idUsuario).includes(q)
      );
    });
  }, [usuarios, search]);

  const cambiarRol = async () => {
    if (!cambioPendiente) return;

    const { usuario, rol } = cambioPendiente;

    try {
      setSavingId(usuario.idUsuario);

      await httpClient.putAuth(`/api/admin/usuarios/${usuario.idUsuario}/rol`, {
        idRol: rol.idRol,
      });

      setUsuarios((prev) =>
        prev.map((item) =>
          item.idUsuario === usuario.idUsuario
            ? { ...item, idRol: rol.idRol }
            : item
        )
      );

      setCambioPendiente(null);

      Toast.show({
        type: "success",
        text1: "Rol actualizado correctamente",
        text2: `${getNombreUsuario(usuario)} ahora es ${rol.label}`,
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
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center px-4">
          <View className="bg-white rounded-3xl w-full max-w-4xl max-h-[85%] overflow-hidden">
            <View className="px-6 py-5 border-b border-gray-100 flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-2xl bg-[#f1e7ff] items-center justify-center">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={23}
                      color="#8b2cff"
                    />
                  </View>

                  <View className="flex-1">
                    <ThemedText className="text-2xl font-bold text-[#050816]">
                      Acceso de administradores
                    </ThemedText>
                    <ThemedText className="text-gray-500 mt-1">
                      Cambia el rol de los usuarios registrados.
                    </ThemedText>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={onClose}
                className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={23} color="#050816" />
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
                    const nombre = getNombreUsuario(usuario);
                    const correo =
                      usuario.correo || usuario.email || "Sin correo";
                    const saving = savingId === usuario.idUsuario;
                    const rolActual = getRolLabel(usuario.idRol);

                    return (
                      <View
                        key={usuario.idUsuario}
                        className="border border-gray-100 rounded-3xl p-4 mb-3 bg-white shadow-sm"
                      >
                        <View className="flex-row items-center justify-between gap-4 flex-wrap">
                          <View className="flex-row items-center gap-3 flex-1 min-w-[230px]">
                            <View className="w-12 h-12 rounded-2xl bg-[#f1e7ff] items-center justify-center">
                              <ThemedText className="text-[#8b2cff] font-black text-lg">
                                {nombre.charAt(0).toUpperCase()}
                              </ThemedText>
                            </View>

                            <View className="flex-1">
                              <ThemedText className="text-lg font-bold text-[#050816]">
                                {nombre}
                              </ThemedText>

                              <ThemedText className="text-gray-500 mt-1">
                                {correo}
                              </ThemedText>

                              <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                                <ThemedText className="text-xs text-gray-400">
                                  ID usuario: {usuario.idUsuario}
                                </ThemedText>

                                <View className="px-3 py-1 rounded-full bg-gray-100">
                                  <ThemedText className="text-xs font-bold text-[#050816]">
                                    Rol actual: {rolActual}
                                  </ThemedText>
                                </View>
                              </View>
                            </View>
                          </View>

                          <View className="flex-row gap-2 flex-wrap justify-end">
                            {roles.map((rol) => {
                              const activo =
                                Number(usuario.idRol) === Number(rol.idRol);

                              return (
                                <Pressable
                                  key={rol.idRol}
                                  disabled={saving || activo}
                                  onPress={() =>
                                    setCambioPendiente({ usuario, rol })
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

      <Modal visible={!!cambioPendiente} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <View className="bg-white rounded-3xl w-full max-w-md p-6">
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-[#f1e7ff] items-center justify-center mb-4">
                <Ionicons name="alert-circle-outline" size={34} color="#8b2cff" />
              </View>

              <ThemedText className="text-2xl font-black text-[#050816] text-center">
                Confirmar cambio de rol
              </ThemedText>

              <ThemedText className="text-gray-500 text-center mt-3 leading-6">
                ¿Estás seguro de cambiar el rol de{" "}
                <ThemedText className="font-bold text-[#050816]">
                  {cambioPendiente
                    ? getNombreUsuario(cambioPendiente.usuario)
                    : ""}
                </ThemedText>{" "}
                a{" "}
                <ThemedText className="font-bold text-[#8b2cff]">
                  {cambioPendiente?.rol.label}
                </ThemedText>
                ?
              </ThemedText>
            </View>

            <View className="flex-row gap-3 mt-7">
              <Pressable
                disabled={savingId !== null}
                onPress={() => setCambioPendiente(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 items-center"
              >
                <ThemedText className="font-bold text-[#050816]">
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                disabled={savingId !== null}
                onPress={cambiarRol}
                className="flex-1 py-3 rounded-2xl bg-[#8b2cff] items-center"
              >
                {savingId !== null ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText className="font-bold text-white">
                    Sí, cambiar
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}