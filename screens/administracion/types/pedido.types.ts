export type DetallePedido = {
  idDetallePedido: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subTotal: number;

  producto?: {
    idProducto?: number;
    nombre?: string;
    imagen?: string;
    precio?: number;

    categoria?: {
      idCategoria?: number;
      nombre?: string;
    };
  };
};

export type Pedido = {
  idPedido: number;
  estado: "pendiente" | "pagado" | "cancelado" | "entregado";
  total: number;
  tipoPago: "contra_entrega" | "qr" | "tarjeta";
  observacion?: string;
  fechaCreacion: string;

 usuario?: {
  idUsuario?: number;
  nombre?: string;
  nombres?: string;
  name?: string;
  correo?: string;
  celular?: string;
  telefono?: string;
};

  detalles: DetallePedido[];
};