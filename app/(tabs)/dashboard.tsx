import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  ChevronRight,
  Bell
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getCameras, getAnalytics } from "../../src/services/api";
import { connectAlertsSocket } from "../../src/services/websocket";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";
import { ShadowCard } from "../../components/ui/ShadowCard";
import AlertCard from "../../src/components/AlertCard";

const { width } = Dimensions.get('window');

/**
 * Pulse 5G - Premium Edge Performance Dashboard
 * UI inspired by LeafLens with Yellow Accent
 */
export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const theme = Colors.dark;

  const loadData = useCallback(async () => {
    try {
      const [camerasData, analyticsData] = await Promise.all([
        getCameras().catch(() => []),
        getAnalytics().catch(() => null)
      ]);
      setCameras(camerasData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    const ws = connectAlertsSocket((data) => {
      setAlerts((prev) => [data, ...prev]);
    });
    return () => ws.close();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const isCameraLive = cameras.some((c) => c?.status === "Online");
  const activeCameras = cameras.filter((c) => c?.status === "Online").length;

  // Chart configuration
  const chartData = useMemo(() => {
    const data = analytics?.loadTrend || [20, 45, 28, 80, 99, 43, 50]; 
    return {
      labels: Array(data.length).fill('').map((_, i) => `${i + 1}`),
      datasets: [{
        data: data,
        color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`,
        strokeWidth: 3
      }]
    };
  }, [analytics]);

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
            <View style={styles.statIconBadge}>
              <ShieldCheck size={20} color={theme.success} />
            </View>
            <View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Edge Node Health</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValueLarge, { color: theme.text }]}>99.8%</Text>
                <View style={styles.trendBadge}>
                  <TrendingUp size={12} color={theme.success} />
                  <Text style={[styles.trendText, { color: theme.success }]}>OPTIMAL</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCardSmall, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.miniIcon, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
              <Target size={16} color={theme.accent} />
            </View>
            <Text style={[styles.statValueSmall, { color: theme.text }]}>{activeCameras}/{cameras.length}</Text>
            <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>Active Cameras</Text>
          </View>
          <View style={[styles.statCardSmall, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.miniIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Activity size={16} color={theme.success} />
            </View>
            <Text style={[styles.statValueSmall, { color: theme.text }]}>{isCameraLive ? 'Live' : 'Off'}</Text>
            <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>System Status</Text>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>Network Load Trend</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => router.push('/incidents')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 13, marginRight: 2 }}>View All</Text>
              <ChevronRight size={14} color={theme.accent} />
            </View>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <View style={[styles.noAlertsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Bell size={24} color={theme.textSecondary} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>No active alerts detected</Text>
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 2,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  iconGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
