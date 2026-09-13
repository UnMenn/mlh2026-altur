const WHATSAPP_NUMBER =
  import.meta.env
    .VITE_WHATSAPP_NUMBER ||
  "5210000000000";

export function getWhatsAppUrl() {
  const message =
    encodeURIComponent(
      "Hola, quiero continuar mi atención con Altur.",
    );

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export function openWhatsApp() {
  window.open(
    getWhatsAppUrl(),
    "_blank",
    "noopener,noreferrer",
  );
}