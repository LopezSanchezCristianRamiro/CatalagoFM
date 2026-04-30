import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { Pedido } from "../types/pedido.types";
import AdminSelectModal from "./AdminSelectModal";
import EstadoBadge from "./Estadobadge";
import PedidoProductoItem from "./PedidoProductoItem";

const estados = [
  { label: "Pendiente", value: "pendiente" },
  { label: "Pagado", value: "pagado" },
  { label: "Cancelado", value: "cancelado" },
  { label: "Entregado", value: "entregado" },
];

function formatFecha(fecha: string) {
  const date = new Date(fecha);

  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPago(tipoPago: string) {
  if (tipoPago === "contra_entrega") return "Contra Entrega";
  if (tipoPago === "qr") return "QR";
  if (tipoPago === "tarjeta") return "Tarjeta";

  return tipoPago;
}

function getNombreUsuario(usuario: Pedido["usuario"]) {
  if (!usuario) return "Cliente no disponible";

  return (
    usuario.nombre ||
    usuario.nombres ||
    usuario.name ||
    usuario.correo ||
    "Cliente sin nombre"
  );
}

function abrirWhatsApp(pedido: Pedido) {
  const telefono = pedido.usuario?.telefono || pedido.usuario?.celular;
  if (!telefono) return;

  const limpio = telefono.replace(/\D/g, "");
  const numero = limpio.startsWith("591") ? limpio : `591${limpio}`;

  const nombre = getNombreUsuario(pedido.usuario);

  const productos = pedido.detalles
    .map((item) => {
      const nombreProd = item.producto?.nombre || "Producto";
      const precio = Number(item.precioUnitario).toFixed(2);

      return `• ${nombreProd}\n  Cantidad: ${item.cantidad}\n  Precio: Bs. ${precio}`;
    })
    .join("\n\n");

  const mensaje = `Hola ${nombre}, este es el detalle de tu pedido:

${productos}

Total: Bs. ${Number(pedido.total).toFixed(2)}

Gracias por tu compra 🙌`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  Linking.openURL(url).catch(() => {
    alert("No se pudo abrir WhatsApp");
  });
}

export default function PedidoCard({
  pedido,
  isMobile = false,
  onEstadoChange,
}: {
  pedido: Pedido;
  isMobile?: boolean;
  onEstadoChange?: (idPedido: number, estado: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [savingEstado, setSavingEstado] = useState(false);

  const telefono = pedido.usuario?.telefono || pedido.usuario?.celular;
  const nombre = getNombreUsuario(pedido.usuario);

  const handleCambiarEstado = async (estado: string) => {
    if (!onEstadoChange) {
      setOpenEstado(false);
      return;
    }

    try {
      setSavingEstado(true);
      await onEstadoChange(pedido.idPedido, estado);
    } finally {
      setSavingEstado(false);
      setOpenEstado(false);
    }
  };

  return (
    <View className="bg-white border border-gray-200 rounded-2xl mb-5 overflow-hidden shadow-sm">
      <Pressable onPress={() => setOpen(!open)} className="p-5">
        <View className="flex-row justify-between items-center">
          <ThemedText className="text-lg font-bold text-[#141442]">
            Pedido #{pedido.idPedido}
          </ThemedText>

          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                setOpenEstado(true);
              }}
            >
              <EstadoBadge estado={pedido.estado} />
            </Pressable>

            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={22}
              color="#141442"
            />
          </View>
        </View>

        <View
          className={
            isMobile
              ? "mt-4 gap-3"
              : "mt-4 flex-row justify-between gap-4"
          }
        >
          <View className="flex-1">
            <ThemedText className="text-gray-500 mb-3">
              {formatFecha(pedido.fechaCreacion)}
            </ThemedText>

            <ThemedText className="text-sm text-gray-500 mb-1">
              Cliente:{" "}
              <ThemedText className="font-bold text-[#141442]">
                {nombre}
              </ThemedText>
            </ThemedText>

            {pedido.usuario?.correo ? (
              <ThemedText className="text-sm text-gray-500 mb-1">
                Correo:{" "}
                <ThemedText className="font-bold text-[#141442]">
                  {pedido.usuario.correo}
                </ThemedText>
              </ThemedText>
            ) : null}

            {telefono ? (
              <View className="mt-1 mb-3">
                <ThemedText className="text-sm text-gray-500">
                  Celular:{" "}
                  <ThemedText className="font-bold text-[#141442]">
                    {telefono}
                  </ThemedText>
                </ThemedText>

                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    abrirWhatsApp(pedido);
                  }}
                  className="mt-2 flex-row items-center gap-2 bg-green-100 px-3 py-2 rounded-lg self-start"
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#16a34a" />
                  <ThemedText className="text-green-700 font-bold text-xs">
                    Enviar WhatsApp
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}

            <ThemedText className="text-[#141442] mt-2">
              Pago:{" "}
              <ThemedText className="font-bold text-[#141442]">
                {formatPago(pedido.tipoPago)}
              </ThemedText>
            </ThemedText>

            {pedido.observacion ? (
              <ThemedText className="italic text-gray-400 mt-2">
                “{pedido.observacion}”
              </ThemedText>
            ) : null}
          </View>

          <ThemedText className="text-purple-600 font-bold text-lg">
            Bs. {Number(pedido.total).toFixed(2)}
          </ThemedText>
        </View>
      </Pressable>

      {open && (
        <View className="border-t border-gray-200 bg-white">
          <ThemedText className="text-center font-bold text-[#141442] py-4">
            Productos
          </ThemedText>

          {pedido.detalles.map((item) => (
            <PedidoProductoItem key={item.idDetallePedido} item={item} />
          ))}
        </View>
      )}

      <AdminSelectModal
        visible={openEstado}
        title="Cambiar estado"
        options={estados}
        selectedValue={pedido.estado}
        onSelect={handleCambiarEstado}
        onClose={() => {
          if (!savingEstado) setOpenEstado(false);
        }}
      />
    </View>
  );
}