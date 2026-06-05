// useQrPago.ts
import { useCallback, useRef, useState } from "react";

const API_BASE =
  process.env.EXPO_PUBLIC_QR_API_BASE?.trim() ||
  "https://sistemapayqr.metasoft-bolivia.com/api/economico/1/qr";

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
    async (monto: number, descripcion = "Pago de pedido") => {
      setEstadoQr("generando");
      try {
        const res = await fetch(`${API_BASE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monto: String(monto),
            moneda: "BOB",
            descripcion,
            branchCode: "",
          }),
        });
        const json = await res.json();
        if (json?.ok && montadoRef.current) {
          setQrData(json);
          qrIdRef.current = json.qr_id;
          setEstadoQr("esperando");
        } else {
          throw new Error();
        }
      } catch {
        setEstadoQr("error");
        setErrorMsg("No se pudo generar el QR");
      }
    },
    [],
  );

  const verificarPago = useCallback(
    async (silencioso = false) => {
      if (!qrIdRef.current || estadoQr === "confirmado") return;

      // Si no es silencioso (clic manual), mostrar cargando. Si es polling, no mover la UI.
      if (!silencioso) {
        setIsVerifying(true);
        setEstadoQr("verificando");
      }

      try {
        const res = await fetch(`${API_BASE}/verificar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qr_id: qrIdRef.current }),
        });
        const json = await res.json();
        const pagoRealizado =
          json?.estado !== 0 || json?.body?.statusQrCode !== 0;

        if (pagoRealizado) {
          setEstadoQr("confirmado");
          await onPagoConfirmado();
        } else {
          setEstadoQr("esperando");
        }
      } catch {
        setEstadoQr("esperando");
      } finally {
        setIsVerifying(false);
      }
    },
    [onPagoConfirmado, estadoQr],
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
    },
  };
}
