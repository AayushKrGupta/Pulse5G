export interface Incident {
  event: string; // "fire", "fall", "stand", "running", etc.
  confidence?: number;
  timestamp: string | number;
  severity?: "critical" | "warning" | "info" | "fire" | "fall";
}
