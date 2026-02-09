export const connectAlertsSocket = (onMessage: (data: any) => void) => {
  const ws = new WebSocket("ws://EDGE_SERVER_IP:8000/ws/alerts");

  ws.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };

  return ws;
};
