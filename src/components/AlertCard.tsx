import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle, AlertTriangle, Info, ShieldCheck } from "lucide-react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { Incident } from "../types";

const severityIcons: Record<string, any> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityColors = {
  critical: "#EF4444",
  warning: "#EAB308",
  info: "#3B82F6",
};

export default function AlertCard({ incident }: { incident: Incident }) {
  const IconComponent = severityIcons[incident.severity] || ShieldCheck;
  const color = severityColors[incident.severity as keyof typeof severityColors] || "#9CA3AF";
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
            {incident.event}
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.severityText, { color }]}>
              {incident.severity.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Edge Node Active
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
