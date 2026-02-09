import { getAnalytics } from "@/src/services/api";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { ShadowCard } from "../../components/ui/ShadowCard";

const PERIODS = ["Week", "Month", "Year"] as const;
const CHART_LABELS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const CHART_VALUES = [320, 410, 280, 530, 380, 460, 500];
const BOTTOM_PADDING = 120;

export default function Analytics() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<typeof PERIODS[number]>("Week");

  useEffect(() => {
    getAnalytics().then(setStats).catch(() =>
      setStats({ total_incidents: 0, critical: 0, warning: 0 })
    );
  }, []);

  const critical = stats?.critical ?? 0;
  const warning = stats?.warning ?? 0;
  const maxVal = Math.max(...CHART_VALUES, 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { paddingHorizontal: 20 }]}
      >
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#8e8e93" />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + BOTTOM_PADDING },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(60).springify()}
          style={styles.periodWrap}
        >
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodTab, period === p && styles.periodTabActive]}
            >
              <Text
                style={[styles.periodText, period === p && styles.periodTextActive]}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        <ShadowCard delay={100} index={0} style={styles.chartCard}>
          <View style={styles.chartInner}>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartYLabel}>{Math.max(...CHART_VALUES)}</Text>
              <Text style={styles.chartYLabel}>0</Text>
            </View>
            <View style={styles.chartBarsWrap}>
              {CHART_VALUES.map((val, i) => (
                <View key={i} style={styles.barCol}>
                  <Animated.View
                    entering={FadeInDown.delay(150 + i * 40).springify()}
                    style={[
                      styles.chartBar,
                      { height: Math.max(8, (val / maxVal) * 120) },
                    ]}
                  />
                </View>
              ))}
            </View>
            <View style={styles.chartXAxis}>
              {CHART_LABELS.map((l, i) => (
                <Text key={i} style={styles.chartXLabel}>
                  {l}
                </Text>
              ))}
            </View>
          </View>
        </ShadowCard>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.summarySection}
        >
          <View style={[styles.summaryRow, styles.summaryRowBorder]}>
            <View style={styles.summaryLabelRow}>
              <Ionicons name="alert-circle-outline" size={18} color="#8e8e93" />
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <Text style={styles.summaryValue}>{critical}</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <Ionicons name="warning-outline" size={18} color="#8e8e93" />
              <Text style={styles.summaryLabel}>Warnings</Text>
            </View>
            <Text style={styles.summaryValue}>{warning}</Text>
          </View>
        </Animated.View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  periodWrap: {
    flexDirection: "row",
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  periodTabActive: { backgroundColor: "rgba(255,255,255,0.1)" },
  periodText: { fontSize: 15, fontWeight: "600", color: "#8e8e93" },
  periodTextActive: { color: "#e5e5e5" },
  chartCard: { marginBottom: 20 },
  chartInner: { padding: 20 },
  chartYAxis: {
    position: "absolute",
    left: 20,
    top: 20,
    bottom: 44,
    justifyContent: "space-between",
  },
  chartYLabel: { fontSize: 11, color: "#8e8e93" },
  chartBarsWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    marginLeft: 44,
    marginRight: 8,
    gap: 8,
  },
  barCol: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "100%",
    minHeight: 8,
    backgroundColor: "#eef2f6",
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 44,
    marginTop: 8,
    paddingRight: 8,
  },
  chartXLabel: { fontSize: 11, color: "#8e8e93" },
  summarySection: {
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  summaryLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryLabel: { fontSize: 15, color: "#8e8e93", fontWeight: "500" },
  summaryValue: { fontSize: 17, fontWeight: "700", color: "#e5e5e5" },
});
