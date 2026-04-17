import { getWsUrl, subscribeToIpChanges } from './config';

export const connectAlertsSocket = (onMessage: (data: any) => void) => {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  const connect = () => {
    try {
      ws = new WebSocket(getWsUrl());

      ws.onopen = () => {
        console.log('🔥 Connected to fire detection WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        // silently handle - onclose will fire after this
      };

      ws.onclose = () => {
        if (!isClosed) {
          // Auto-reconnect after 1 second
          reconnectTimer = setTimeout(connect, 1000);
        }
      };
    } catch (err) {
      // Connection failed, retry
      if (!isClosed) {
        reconnectTimer = setTimeout(connect, 1000);
      }
    }
  };

  connect();

  // Re-connect ONLY IF IP changes
  const unsubscribe = subscribeToIpChanges(() => {
    if (ws) {
      console.log("🔄 Config changed, reconnecting WebSocket...");
      ws.close();
      connect(); // Reconnect immediately with NEW IP
    }
  });

  // Return a close-able object
  return {
    close: () => {
      isClosed = true;
      unsubscribe();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    },
  };
};
