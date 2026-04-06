import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle, AlertTriangle, Info, ShieldCheck, Flame } from "lucide-react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { Incident } from "../types";

const severityIcons: Record<string, any> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  fire: Flame, // 🔥 Fire detection icon
};

const severityColors = {
  critical: "#EF4444",
  warning: "#EAB308",
  info: "#3B82F6",
  fire: "#DC2626", // 🔥 Fire detection color
};

export default function AlertCard({ incident }: { incident: Incident }) {
  // 🔥 Handle fire detection events
  const isFireEvent = incident.event === "fire" || incident.severity === "fire";
  const IconComponent = isFireEvent ? Flame : (severityIcons[incident.severity] || ShieldCheck);
  const color = isFireEvent ? severityColors.fire : (severityColors[incident.severity as keyof typeof severityColors] || "#9CA3AF");
  const theme = Colors.dark;

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
            {isFireEvent ? "🔥 Fire Detected" : incident.event}
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.severityText, { color }]}>
              {isFireEvent ? "FIRE" : (incident.severity?.toUpperCase() || "INFO")}
            </Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {new Date(typeof incident.timestamp === 'number' && incident.timestamp < 1e12 ? incident.timestamp * 1000 : incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isFireEvent && incident.confidence && (
            <Text> • Confidence: {(incident.confidence * 100).toFixed(1)}%</Text>
          )}
          {" • Edge Node Active"}
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
