import { getAnalytics } from "@/src/services/api";
import { useEffect, useMemo, useState } from "react";
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
type Period = (typeof PERIODS)[number];

// Chart data per period – bars and labels change when period changes
const CHART_DATA: Record<
  Period,
  { labels: string[]; values: number[] }
> = {
  Week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [24, 18, 32, 28, 41, 35, 22],
  },
  Month: {
    labels: ["W1", "W2", "W3", "W4"],
    values: [98, 124, 87, 156],
  },
  Year: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [320, 410, 280, 530, 380, 460, 500, 440, 520, 390, 470, 510],
  },
};

const BAR_COLOR = "#EAB308";
const BOTTOM_PADDING = 120;
const CHART_BAR_MAX_HEIGHT = 140;

export default function Analytics() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("Week");

  useEffect(() => {
    getAnalytics().then(setStats).catch(() =>
      setStats({ total_incidents: 0, critical: 0, warning: 0 })
    );
  }, []);

  const { labels, values } = useMemo(
    () => CHART_DATA[period],
    [period]
  );
  const maxVal = useMemo(
    () => Math.max(...values, 1),
    [values]
  );

  const critical = stats?.critical ?? 0;
  const warning = stats?.warning ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { paddingHorizontal: 20 }]}
      >
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
              <Text style={styles.chartYLabel}>{maxVal}</Text>
              <Text style={styles.chartYLabel}>0</Text>
            </View>
            <View style={styles.chartBarsWrap} key={period}>
              {values.map((val, i) => (
                <View key={`${period}-${i}`} style={styles.barCol}>
                  <Animated.View
                    entering={FadeInDown.delay(80 + i * 30).springify()}
                    style={[
                      styles.chartBar,
                      {
                        height: Math.max(8, (val / maxVal) * CHART_BAR_MAX_HEIGHT),
                        backgroundColor: BAR_COLOR,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
            <View style={styles.chartXAxis}>
              {labels.map((l, i) => (
                <Text key={`${period}-x-${i}`} style={styles.chartXLabel} numberOfLines={1}>
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
  periodTabActive: { backgroundColor: "rgba(234,179,8,0.25)" },
  periodText: { fontSize: 15, fontWeight: "600", color: "#8e8e93" },
  periodTextActive: { color: "#EAB308", fontWeight: "700" },
  chartCard: { marginBottom: 24, borderRadius: 24, overflow: "hidden" },
  chartInner: { padding: 24, paddingLeft: 36 },
  chartYAxis: {
    position: "absolute",
    left: 24,
    top: 24,
    bottom: 52,
    justifyContent: "space-between",
  },
  chartYLabel: { fontSize: 11, color: "#8e8e93", fontWeight: "600" },
  chartBarsWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: CHART_BAR_MAX_HEIGHT,
    marginLeft: 8,
    marginRight: 8,
    gap: 6,
  },
  barCol: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "80%",
    minHeight: 8,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#EAB308",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  chartXAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 8,
    marginTop: 12,
    paddingRight: 8,
  },
  chartXLabel: {
    flex: 1,
    fontSize: 10,
    color: "#8e8e93",
    textAlign: "center",
  },
  summarySection: {
    backgroundColor: "#1c1c1e",
    borderRadius: 24,
    padding: 24,
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
    paddingVertical: 14,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  summaryLabelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryLabel: { fontSize: 15, color: "#8e8e93", fontWeight: "500" },
  summaryValue: { fontSize: 18, fontWeight: "700", color: "#e5e5e5" },
});
