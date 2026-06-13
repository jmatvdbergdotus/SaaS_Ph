import { useEffect, useState } from "react";
import * as Network from "expo-network";

export type NetworkStatus = "online" | "offline" | "unknown";

export function useNetworkState(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>("unknown");

  useEffect(() => {
    async function check() {
      const state = await Network.getNetworkStateAsync();
      setStatus(state.isConnected ? "online" : "offline");
    }
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
