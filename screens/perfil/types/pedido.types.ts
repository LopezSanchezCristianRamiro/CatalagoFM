// screens/perfil/types/pedido.types.ts

export interface FotoProducto {
  idFotoProducto: number;
  urlFoto: string | null;
  idProducto: number;
}

export interface ProductoDetalle {
  idProducto: number;
  nombre: string;
  descripcion: string | null;
  precio: string;
  precioDescuento: string | null;
  idCategoria: number | null;
  fotos: FotoProducto[];
}

export interface DetallePedido {
  idDetallePedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: string;
  subTotal: string;
  producto: ProductoDetalle;
}

export interface Pedido {
  idPedido: number;
  estado: "pendiente" | "pagado" | "cancelado" | "entregado";
  total: string | null;
  tipoPago: "contra_entrega" | "qr" | "tarjeta" | null;
  observacion: string | null;
  fechaCreacion: string;
  idUsuario: number;
  detalles: DetallePedido[];
}
