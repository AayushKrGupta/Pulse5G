export const connectAlertsSocket = (onMessage: (data: any) => void) => {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  const connect = () => {
    try {
      ws = new WebSocket("ws://172.16.0.17:8000/ws");

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
          // Auto-reconnect after 5 seconds
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    } catch (err) {
      // Connection failed, retry
      if (!isClosed) {
        reconnectTimer = setTimeout(connect, 5000);
      }
    }
  };

  connect();

  // Return a close-able object
  return {
    close: () => {
      isClosed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    },
  };
};
