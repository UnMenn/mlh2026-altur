import { useState } from "react";
import type { Channel } from "../types";

export function useChannel() {
  const [channel, setChannel] =
    useState<Channel | null>(null);

  function openChannel(
    selectedChannel: Channel,
  ) {
    setChannel(selectedChannel);
  }

  function closeChannel() {
    setChannel(null);
  }

  return {
    channel,
    openChannel,
    closeChannel,
  };
}