export interface Incident {
  event: string;
  confidence: number;
  timestamp: string;
  severity: "critical" | "warning" | "info";
}
