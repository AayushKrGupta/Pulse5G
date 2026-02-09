import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Incident } from "../types";

const severityIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  critical: "alert-circle",
  warning: "warning",
  info: "information-circle",
};

export default function AlertCard({ incident }: { incident: Incident }) {
  const iconName = severityIcons[incident.severity] ?? "ellipse";

  return (
    <Animated.View
      entering={FadeInRight.springify()}
      style={styles.card}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={22} color="#8e8e93" />
      </View>
      <View style={styles.content}>
        <Text style={styles.event} numberOfLines={1}>
          {incident.event}
        </Text>
        <Text style={styles.meta}>{incident.timestamp}</Text>
      </View>
      <Text style={styles.amount}>
        {incident.severity === "critical" ? "!" : "—"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  content: { flex: 1 },
  event: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e5e5",
  },
  meta: {
    fontSize: 13,
    color: "#8e8e93",
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8e8e93",
  },
});
