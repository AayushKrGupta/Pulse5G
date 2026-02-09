import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { ShadowCard } from "../../components/ui/ShadowCard";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";

type IncidentItem = { label: string; icon: keyof typeof Ionicons.glyphMap };

const INCIDENTS: IncidentItem[] = [
  { label: "Fire Detected", icon: "flame" },
  { label: "Person Fallen", icon: "person" },
  { label: "Unauthorized Entry", icon: "lock-closed" },
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
        {INCIDENTS.map((item, idx) => (
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
                style={StyleSheet.flatten([
                  styles.incidentCard,
                  ...(resolved.includes(idx) ? [styles.incidentCardResolved] : []),
                ])}
              >
                <View style={styles.cardInner}>
                  <View
                    style={[
                      styles.iconBox,
                      resolved.includes(idx) ? styles.iconBoxResolved : styles.iconBoxPending,
                    ]}
                  >
                    <Ionicons
                      name={resolved.includes(idx) ? "checkmark-circle" : item.icon}
                      size={32}
                      color={resolved.includes(idx) ? "#22c55e" : "#EAB308"}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.incidentTitle}>{item.label}</Text>
                    <Text style={styles.incidentMeta}>
                      {resolved.includes(idx) ? "Resolved" : "Tap to mark resolved"}
                    </Text>
                  </View>
                  {resolved.includes(idx) ? (
                    <View style={styles.doneBadge}>
                      <Ionicons name="checkmark-done" size={22} color="#22c55e" />
                    </View>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#e5e5e5",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c1c1e",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  incidentCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 120,
  },
  incidentCardResolved: { backgroundColor: "rgba(34,197,94,0.14)" },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    flex: 1,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  iconBoxPending: { backgroundColor: "rgba(234,179,8,0.18)" },
  iconBoxResolved: { backgroundColor: "rgba(34,197,94,0.2)" },
  cardText: { flex: 1 },
  incidentTitle: { fontSize: 18, fontWeight: "700", color: "#e5e5e5" },
  incidentMeta: { fontSize: 14, color: "#8e8e93", marginTop: 4 },
  doneBadge: { marginLeft: 8 },
});
