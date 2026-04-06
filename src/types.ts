export interface Incident {
  event: string;
  confidence?: number; // Optional for non-fire events
  timestamp: string | number;
  severity: "critical" | "warning" | "info" | "fire";
}
