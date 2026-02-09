import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { ShadowCard } from "../../components/ui/ShadowCard";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";

const INCIDENTS = [
  "Fire Detected",
  "Person Fallen",
  "Unauthorized Entry",
];

export default function Incidents() {
  const insets = useSafeAreaInsets();
  const [resolved, setResolved] = useState<number[]>([]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { paddingHorizontal: 20 }]}
      >
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Incident History</Text>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#8e8e93" />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {INCIDENTS.map((label, idx) => (
          <AnimatedListItem key={idx} index={idx}>
            <Pressable
              onPress={() =>
                setResolved((r) => (r.includes(idx) ? r.filter((i) => i !== idx) : [...r, idx]))
              }
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <ShadowCard
                delay={0}
                index={idx}
                style={[
                  styles.incidentCard,
                  resolved.includes(idx) && styles.incidentCardResolved,
                ]}
              >
                <View style={styles.incidentRow}>
                  <View
                    style={[
                      styles.incidentIconWrap,
                      resolved.includes(idx) ? styles.incidentIconResolved : styles.incidentIconPending,
                    ]}
                  >
                    <Ionicons
                      name={resolved.includes(idx) ? "checkmark-circle" : "alert-circle-outline"}
                      size={24}
                      color={resolved.includes(idx) ? "#22c55e" : "#f59e0b"}
                    />
                  </View>
                  <View style={styles.incidentContent}>
                    <Text style={styles.incidentTitle}>{label}</Text>
                    <Text style={styles.incidentMeta}>
                      {resolved.includes(idx) ? "Resolved" : "Tap to mark resolved"}
                    </Text>
                  </View>
                  {resolved.includes(idx) ? (
                    <Ionicons name="checkmark-done" size={20} color="#22c55e" />
                  ) : null}
                </View>
              </ShadowCard>
            </Pressable>
          </AnimatedListItem>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingVertical: 8,
  },
  headerSpacer: { width: 40, height: 40 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#e5e5e5" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c1c1e",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  incidentCard: { marginBottom: 12 },
  incidentCardResolved: { backgroundColor: "rgba(34,197,94,0.12)" },
  incidentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  incidentIconWrap: { marginRight: 14 },
  incidentIconPending: {},
  incidentIconResolved: {},
  incidentContent: { flex: 1 },
  incidentTitle: { fontSize: 16, fontWeight: "600", color: "#e5e5e5" },
  incidentMeta: { fontSize: 13, color: "#8e8e93", marginTop: 2 },
});
