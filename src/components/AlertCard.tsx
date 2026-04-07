import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle, AlertTriangle, Info, ShieldCheck, Flame, PersonStanding, Accessibility, Activity } from "lucide-react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { Incident } from "../types";

const severityIcons: Record<string, any> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  fire: Flame,
  fall: AlertTriangle, // Alert for fall detection
  running: Activity,
  stand: PersonStanding,
};

const severityColors = {
  critical: "#EF4444",
  warning: "#EAB308",
  info: "#3B82F6",
  fire: "#DC2626",
  fall: "#F97316", // Orange for fall events
  running: "#10B981",
  stand: "#3B82F6",
};

export default function AlertCard({ incident }: { incident: Incident }) {
  // 🔥 Handle detection events
  const isFireEvent = incident.event === "fire";
  const isFallEvent = incident.event === "fall";
  const isPriorityEvent = isFireEvent || isFallEvent;
  
  // Decide icon based on event label from backend
  const getIcon = () => {
    if (isFireEvent) return Flame;
    if (isFallEvent) return AlertTriangle;
    if (incident.event === "stand") return PersonStanding;
    if (incident.event === "running") return Accessibility;
    return severityIcons[incident.severity || ""] || ShieldCheck;
  };

  const getColor = () => {
    if (isFireEvent) return severityColors.fire;
    if (isFallEvent) return severityColors.fall;
    if (incident.event === "stand") return severityColors.stand;
    if (incident.event === "running") return severityColors.running;
    return severityColors[incident.severity as keyof typeof severityColors] || "#9CA3AF";
  };

  const IconComponent = getIcon();
  const color = getColor();
  const theme = Colors.dark;

  // Format label from backend (e.g. "fall" -> "Fall Detected")
  const getLabel = () => {
    if (isFireEvent) return "🔥 Fire Detected";
    if (isFallEvent) return "⚠️ Fall Detected";
    return incident.event.charAt(0).toUpperCase() + incident.event.slice(1);
  };

  return (
    <Animated.View
      entering={FadeInRight.springify()}
      style={styles.card}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
        <IconComponent size={24} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.event, { color: theme.text }]} numberOfLines={1}>
            {getLabel()}
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.severityText, { color }]}>
              {isPriorityEvent ? "CRITICAL" : (incident.severity?.toUpperCase() || "INFO")}
            </Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {new Date(typeof incident.timestamp === 'number' && incident.timestamp < 1e12 ? incident.timestamp * 1000 : incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {incident.confidence && (
            <Text> • Confidence: {(incident.confidence * 100).toFixed(1)}%</Text>
          )}
          {" • Edge AI Node"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  content: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  event: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 9,
    fontWeight: "800",
  },
  meta: {
    fontSize: 13,
    fontWeight: "500",
  },
});
