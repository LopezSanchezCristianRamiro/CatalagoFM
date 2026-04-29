import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import AdminSelectModal from "./AdminSelectModal";

type Props = {
  estado: string;
  setEstado: (value: string) => void;
  categoria: string;
  setCategoria: (value: string) => void;
  isMobile?: boolean;
};

const estados = [
  { label: "Todos", value: "todos" },
  { label: "Pendiente", value: "pendiente" },
  { label: "Pagado", value: "pagado" },
  { label: "Cancelado", value: "cancelado" },
  { label: "Entregado", value: "entregado" },
];

const categorias = [
  { label: "Todas", value: "todas" },
  { label: "Promos", value: "Promos" },
  { label: "Series y Novelas", value: "Series y Novelas" },
  { label: "Herramientas", value: "Herramientas" },
  { label: "TV en Vivo", value: "TV en Vivo" },
  { label: "Deportes", value: "Deportes" },
  { label: "Música", value: "Música" },
  { label: "Streaming", value: "Streaming" },
];

export default function AdminFilters({
  estado,
  setEstado,
  categoria,
  setCategoria,
  isMobile = false,
}: Props) {
  const [openCategoria, setOpenCategoria] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);

  const estadoLabel =
    estados.find((item) => item.value === estado)?.label || "Estado";

  const categoriaLabel =
    categorias.find((item) => item.value === categoria)?.label || "Categoría";

  return (
    <>
      <View
        className={
          isMobile
            ? "flex-row flex-wrap gap-3"
            : "flex-row items-center gap-3"
        }
      >
        <Pressable
          onPress={() => setOpenCategoria(true)}
          className={
            isMobile
              ? "bg-[#f8f4f3] px-4 py-3 rounded-lg flex-row items-center gap-2"
              : "bg-[#f8f4f3] px-5 py-3 rounded-lg flex-row items-center gap-2"
          }
        >
          <ThemedText className="text-xs text-[#141442]">
            {categoria === "todas" ? "Categoría" : categoriaLabel}
          </ThemedText>
          <Ionicons name="chevron-down" size={14} color="#141442" />
        </Pressable>

        <Pressable
          onPress={() => setOpenEstado(true)}
          className={
            isMobile
              ? "bg-[#f8f4f3] px-4 py-3 rounded-lg flex-row items-center gap-2"
              : "bg-[#f8f4f3] px-5 py-3 rounded-lg flex-row items-center gap-2"
          }
        >
          <ThemedText className="text-xs text-[#141442]">
            {estado === "todos" ? "Estado" : estadoLabel}
          </ThemedText>
          <Ionicons name="chevron-down" size={14} color="#141442" />
        </Pressable>

        <Pressable
          onPress={() => {
            setEstado("todos");
            setCategoria("todas");
          }}
          className={
            isMobile
              ? "border border-purple-600 px-4 py-3 rounded-lg"
              : "border border-purple-600 px-5 py-3 rounded-lg"
          }
        >
          <ThemedText className="text-xs font-bold text-purple-600">
            Ver Todos
          </ThemedText>
        </Pressable>
      </View>

      <AdminSelectModal
        visible={openCategoria}
        title="Seleccionar categoría"
        options={categorias}
        selectedValue={categoria}
        onSelect={(value) => setCategoria(value)}
        onClose={() => setOpenCategoria(false)}
      />

      <AdminSelectModal
        visible={openEstado}
        title="Seleccionar estado"
        options={estados}
        selectedValue={estado}
        onSelect={(value) => setEstado(value)}
        onClose={() => setOpenEstado(false)}
      />
    </>
  );
}