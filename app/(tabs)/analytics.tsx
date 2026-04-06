import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, TrendingUp, Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getLatestAlert } from "../../src/services/api";

const { width } = Dimensions.get('window');

const PERIODS = ["Week", "Month", "Year"] as const;
type Period = (typeof PERIODS)[number];

const CHART_DATA: Record<Period, { labels: string[]; values: number[] }> = {
  Week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [2, 1, 3, 0, 4, 3, 2], // Simulating incident volume
  },
  Month: {
    labels: ["W1", "W2", "W3", "W4"],
    values: [8, 12, 7, 15],
  },
  Year: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [30, 41, 28, 53, 38, 46, 50, 44, 52, 39, 47, 51],
  },
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("Week");
  const [stats, setStats] = useState<any>({ critical: 2, warning: 5 });
  const theme = Colors.dark;

  useEffect(() => {
    // Safely sync with latest data for context
    getLatestAlert().then(data => {
      if (data && data.event === 'fire') {
        setStats((prev: any) => ({ ...prev, critical: prev.critical + 1 }));
      }
    }).catch(() => {});
  }, []);

  const currentData = useMemo(() => CHART_DATA[period], [period]);

  const lineChartData = {
    labels: currentData.labels,
    datasets: [{
      data: currentData.values,
      color: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`,
      strokeWidth: 3
    }]
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder, paddingTop: Platform.OS === 'android' ? insets.top : 10 }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Network Analytics</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Period Selector */}
        <View style={[styles.periodWrap, { backgroundColor: theme.card }]}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodTab, period === p && { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}
            >
              <Text
                style={[styles.periodText, { color: period === p ? theme.accent : theme.textSecondary }]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Activity size={18} color={theme.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.chartTitle, { color: theme.text }]}>Incident Volume</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={12} color={theme.success} />
              <Text style={[styles.trendText, { color: theme.success }]}>+12.5%</Text>
            </View>
          </View>
          
          <LineChart
            data={lineChartData}
            width={width - 50}
            height={200}
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
                r: "5",
                strokeWidth: "2",
                stroke: theme.accent
              }
            }}
            bezier
            style={styles.chartStyle}
            withInnerLines={false}
            withVerticalLabels={period !== 'Year'}
          />
        </View>

        {/* Summary Grid */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.miniIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <AlertTriangle size={18} color={theme.error} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{stats?.critical || 12}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Critical</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.miniIcon, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
              <Zap size={18} color={theme.accent} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{stats?.warning || 45}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Warning</Text>
          </View>
        </View>

        {/* Node Health Card */}
        <View style={[styles.healthCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.healthHeader}>
            <ShieldCheck size={24} color={theme.success} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.healthTitle, { color: theme.text }]}>Edge Node Health</Text>
              <Text style={[styles.healthSub, { color: theme.textSecondary }]}>All systems operational</Text>
            </View>
            <View style={styles.healthValueContainer}>
              <Text style={[styles.healthValue, { color: theme.success }]}>99.8%</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 20,
  },
  periodWrap: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chartCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  chartStyle: {
    marginLeft: -15,
    borderRadius: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  miniIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  healthCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  healthSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  healthValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  healthValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
