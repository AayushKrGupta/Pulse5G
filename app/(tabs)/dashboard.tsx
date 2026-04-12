import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  ShieldCheck,
  Target
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";
import { ShadowCard } from "../../components/ui/ShadowCard";
import { Colors } from "../../constants/theme";
import AlertCard from "../../src/components/AlertCard";
import LiveVideoStream from "../../src/components/LiveVideoStream";
import { getLatestAlert } from "../../src/services/api";
import { connectAlertsSocket } from "../../src/services/websocket";

const { width } = Dimensions.get('window');

/**
 * Pulse 5G - Premium Edge Performance Dashboard
 * Integrated with Real-Time AI Fire Detection
 */
export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = Colors.dark;

  const processNewData = useCallback((data: any) => {
    console.log("📥 Edge Data Received:", data);
    setCurrentAlert(data);

    // Update accuracy history if data has confidence
    if (data.confidence !== undefined) {
      console.log("📊 Updating Accuracy:", data.confidence);
      setAccuracyHistory(prev => {
        const newHistory = [...prev, data.confidence * 100];
        // Keep last 10 points for the chart
        return newHistory.slice(-10);
      });
    }

    if (data.event === 'fire' || data.event === 'fall') {
      console.log("🚨 ALARM TRIGGERED:", data.event);
      setAlerts((prev) => {
        // Keep unique by timestamp
        if (prev.length > 0 && prev.some(a => a.timestamp === data.timestamp)) return prev;
        return [data, ...prev].slice(0, 10); // Keep last 10 for dashboard
      });
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const latestAlert = await getLatestAlert().catch(() => null);
      if (latestAlert) {
        processNewData(latestAlert);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }, [processNewData]);

  useEffect(() => {
    loadData();

    // Connect to WebSocket
    let ws = connectAlertsSocket((data) => {
      processNewData(data);
    });

    // Also listen for IP changes to trigger a full refresh
    const { subscribeToIpChanges } = require("../../src/services/config");
    const unsubscribe = subscribeToIpChanges(() => {
      loadData();
      if (ws) ws.close(); // This will trigger the socket to reconnect to the new IP
    });

    return () => {
      ws.close();
      unsubscribe();
    };
  }, [loadData, processNewData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Derived stats
  const avgAccuracy = useMemo(() => {
    if (accuracyHistory.length === 0) return "98.2"; // fallback
    const sum = accuracyHistory.reduce((a, b) => a + b, 0);
    return (sum / accuracyHistory.length).toFixed(1);
  }, [accuracyHistory]);

  const chartData = useMemo(() => {
    const dataPoints = accuracyHistory.length >= 2 ? accuracyHistory : [75, 82, 88, 92, 95, 98, 99];
    return {
      labels: Array(dataPoints.length).fill('').map((_, i) => `${i + 1}`),
      datasets: [{
        data: dataPoints,
        color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`,
        strokeWidth: 3
      }]
    };
  }, [accuracyHistory]);

  const isFireDetected = currentAlert?.event === 'fire';
  const isFallDetected = currentAlert?.event === 'fall';
  const isPriorityAlert = isFireDetected || isFallDetected;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === 'android' ? insets.top : 10 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Pulse 5G</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard</Text>
          </View>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Image
              source={require('../../assets/images/5g.avif')}
              style={styles.headerLogo}
              contentFit="cover"
            />
          </TouchableOpacity>
        </View>

        {/* Primary Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statCardFull, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isPriorityAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
              {isFireDetected ? <Flame size={20} color={theme.error} /> : isFallDetected ? <AlertTriangle size={20} color={theme.error} /> : <ShieldCheck size={20} color={theme.success} />}
            </View>
            <View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>System Status</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValueLarge, { color: isPriorityAlert ? theme.error : theme.text }]}>
                  {isFireDetected ? "FIRE ALARM" : isFallDetected ? "FALL DETECTED" : "SECURE"}
                </Text>
                <View style={[styles.trendBadge, { backgroundColor: isPriorityAlert ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={[styles.trendText, { color: isPriorityAlert ? theme.error : theme.success }]}>
                    {isPriorityAlert ? "CRITICAL" : "OPTIMAL"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCardSmall, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.miniIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Activity size={16} color="#3B82F6" />
            </View>
            <Text style={[styles.statValueSmall, { color: theme.text }]}>0.5ms</Text>
            <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>Edge Latency</Text>
          </View>
          <View style={[styles.statCardSmall, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.miniIcon, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
              <Target size={16} color={theme.accent} />
            </View>
            <Text style={[styles.statValueSmall, { color: theme.text }]}>{avgAccuracy}%</Text>
            <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>AI Accuracy</Text>
          </View>
        </View>

        {/* Live Video Stream */}
        <View style={[styles.videoSection]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Live Edge Camera</Text>
          <LiveVideoStream cameraId="CAM-01" style={isFireDetected ? { borderColor: theme.error, borderWidth: 2 } : {}} />
        </View>

        {/* Performance Chart */}
        <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Real-time AI Accuracy Trend</Text>
            <View style={styles.chartPeriod}>
              <Text style={{ color: theme.accent, fontSize: 11, fontWeight: '700' }}>LIVE MONITORING</Text>
            </View>
          </View>

          <LineChart
            data={chartData}
            width={width - 40}
            height={180}
            chartConfig={{
              backgroundColor: theme.card,
              backgroundGradientFrom: theme.card,
              backgroundGradientTo: theme.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: theme.accent
              }
            }}
            bezier
            style={styles.chartStyle}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={false}
          />
        </View>

        {/* Alerts History Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Incident History</Text>
          <TouchableOpacity onPress={() => router.push('/incidents')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 13, marginRight: 2 }}>View All</Text>
              <ChevronRight size={14} color={theme.accent} />
            </View>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <View style={[styles.noAlertsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <CheckCircle2 size={24} color={theme.success} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>No critical incidents detected</Text>
          </View>
        ) : (
          alerts.slice(0, 5).map((item, idx) => (
            <AnimatedListItem key={idx} index={idx}>
              <ShadowCard delay={0} index={idx} style={Object.assign({}, styles.alertCardContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder })}>
                <AlertCard incident={item} />
              </ShadowCard>
            </AnimatedListItem>
          ))
        )}

        {/* Extra space for floating bottom bar */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCardFull: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statCardSmall: {
    width: (width - 55) / 2,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  miniIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueLarge: {
    fontSize: 28,
    fontWeight: '800',
    marginRight: 10,
  },
  statValueSmall: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  statLabelSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 9,
    fontWeight: '800',
  },
  chartContainer: {
    padding: 20,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 24,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartPeriod: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  alertCardContainer: {
    marginBottom: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  noAlertsCard: {
    padding: 30,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  videoSection: {
    marginBottom: 24,
  },
});
