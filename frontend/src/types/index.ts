export type Channel =
  | "whatsapp"
  | "sms"
  | "call";

export type AgentState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "connecting";

export interface ChannelConfig {
  id: Channel;
  title: string;
  description: string;
}