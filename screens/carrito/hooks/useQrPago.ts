// useQrPago.ts
import { useCallback, useRef, useState } from "react";

const token =
  process.env.EXPO_PUBLIC_QR_TOKEN?.trim() ||
  "TT01btd81oRazrjeusEihYpe0dFq7pfA";
const API_BASE =
  process.env.EXPO_PUBLIC_QR_API_BASE?.trim() ||
  "https://sistemapayqr.metasoft-bolivia.com/api/economico";

export type EstadoQr =
  | "idle"
  | "generando"
  | "esperando"
  | "verificando"
  | "confirmado"
  | "error";

export function useQrPago(onPagoConfirmado: () => Promise<void>) {
  const [estadoQr, setEstadoQr] = useState<EstadoQr>("idle");
  const [qrData, setQrData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const montadoRef = useRef(true);
  const qrIdRef = useRef<string | null>(null);

  const generarQr = useCallback(
    async (
      monto: number,
      descripcion = "Pago de pedido",
      branchCode = "",
      codigoServicio = "",
    ) => {
      if (!token) {
        setEstadoQr("error");
        setErrorMsg("Token no configurado");
        return;
      }

      setEstadoQr("generando");
      try {
        const res = await fetch(`${API_BASE}/qr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa: { token },
            qr: {
              monto,
              moneda: "BOB",
              descripcion,
              branchCode,
              codigoServicio,
            },
          }),
        });
        const json = await res.json();
        if (json?.ok && montadoRef.current) {
          setQrData(json);
          qrIdRef.current = json.qr_id;
          setEstadoQr("esperando");
        } else {
          throw new Error(json?.message || "Error al generar QR");
        }
      } catch (error: any) {
        setEstadoQr("error");
        setErrorMsg(error.message || "No se pudo generar el QR");
      }
    },
    [token],
  );

  const verificarPago = useCallback(
    async (silencioso = false) => {
      if (!qrIdRef.current || estadoQr === "confirmado") return;
      if (!token) {
        setEstadoQr("error");
        setErrorMsg("Token no configurado");
        return;
      }

      if (!silencioso) {
        setIsVerifying(true);
        setEstadoQr("verificando");
      }

      try {
        const res = await fetch(`${API_BASE}/qr/verificar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa: { token },
            qr: { qr_id: qrIdRef.current },
          }),
        });
        const json = await res.json();

        // Según documentación, estado: 1 = pagado
        const pagoRealizado = json?.estado === 1;

        if (pagoRealizado) {
          setEstadoQr("confirmado");
          await onPagoConfirmado();
        } else {
          setEstadoQr("esperando");
        }
      } catch (error) {
        setEstadoQr("esperando");
      } finally {
        setIsVerifying(false);
      }
    },
    [token, onPagoConfirmado, estadoQr],
  );

  return {
    estadoQr,
    qrData,
    errorMsg,
    isVerifying,
    generarQr,
    verificarPago,
    resetQr: () => {
      setEstadoQr("idle");
      setQrData(null);
      qrIdRef.current = null;
      setErrorMsg(null);
    },
  };
}
