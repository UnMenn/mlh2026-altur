export type SmsMessage = {
  id: number;
  sender: "assistant" | "user";
  text: string;
};

const mockMessages: SmsMessage[] = [
  {
    id: 1,
    sender: "assistant",
    text:
      "Detectamos que estás revisando un cargo que no reconoces.",
  },
  {
    id: 2,
    sender: "user",
    text:
      "Sí, quiero revisarlo.",
  },
  {
    id: 3,
    sender: "assistant",
    text:
      "Perfecto. Antes de continuar, verificaremos tu identidad.",
  },
];

export async function getSmsMessages() {
  return mockMessages;
}

export async function sendSmsMessage(
  text: string,
) {
  return {
    id: Date.now(),
    sender: "user" as const,
    text,
  };
}