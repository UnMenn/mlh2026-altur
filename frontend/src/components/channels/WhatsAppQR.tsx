import { useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";

type WhatsAppQRProps = {
  phoneNumber: string;
  sessionId?: string;
};

export function WhatsAppQR({
  phoneNumber,
  sessionId,
}: WhatsAppQRProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const whatsappUrl = useMemo(() => {
    const message = sessionId
      ? `Hola, quiero continuar mi sesión ${sessionId}`
      : "Hola, quiero continuar mi atención con Altur.";

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
  }, [phoneNumber, sessionId]);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      whatsappUrl,
      {
        width: 180,
        margin: 1,
        color: {
          dark: "#292929",
          light: "#ffffff",
        },
      }
    ).catch((error) => {
      console.error("QR generation failed:", error);
    });
  }, [whatsappUrl]);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-qr"
      aria-label="Abrir conversación en WhatsApp"
    >
      <canvas ref={canvasRef} />
    </a>
  );
}