import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, ShieldCheck, Activity, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";

const INITIAL_INCIDENTS = [
  { id: '1', event: "Fire Detected", status: "Resolved", timestamp: new Date().toISOString(), severity: "critical", confidence: 0.98 },
  { id: '2', event: "Person Fallen", status: "Pending", timestamp: new Date(Date.now() - 3600000).toISOString(), severity: "high", confidence: 0.92 },
  { id: '3', event: "Unauthorized Entry", status: "Resolved", timestamp: new Date(Date.now() - 86400000).toISOString(), severity: "medium", confidence: 0.85 },
];

export default function IncidentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [refreshing, setRefreshing] = useState(false);
  const theme = Colors.dark;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const renderItem = (item: any, index: number) => (
    <AnimatedListItem key={item.id} index={index}>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.status === 'Resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)' }]}>
          {item.status === 'Resolved' ? (
            <CheckCircle2 size={32} color={theme.success} />
          ) : (
            <AlertCircle size={32} color={theme.accent} />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemEvent, { color: theme.text }]} numberOfLines={1}>{item.event}</Text>
          <View style={styles.conditionRow}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'Resolved' ? theme.success : theme.accent }]} />
            <Text style={[styles.itemStatus, { color: theme.textSecondary }]} numberOfLines={1}>{item.status}</Text>
          </View>
          <View style={styles.dateRow}>
            <Calendar size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
              {new Date(item.timestamp).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        <View style={styles.itemMeta}>
          <View style={[styles.confidenceBadge, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
            <Text style={[styles.itemConfidence, { color: theme.accent }]}>
              {(item.confidence * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedListItem>
  );

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Incident History</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
      >
        {incidents.length > 0 ? (
          <>
            <View style={styles.statsOverview}>
              <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Activity size={16} color={theme.accent} />
                <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>Total: <Text style={{ color: theme.text, fontWeight: '700' }}>{incidents.length}</Text></Text>
              </View>
              <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <ShieldCheck size={16} color={theme.success} />
                <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>System Active</Text>
              </View>
            </View>

            {incidents.map((item, idx) => renderItem(item, idx))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.glow }]}>
              <Calendar size={40} color={theme.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>History is Empty</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              All future 5G Edge incidents and alerts will appear here.
            </Text>
          </View>
        )}
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
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  statsOverview: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  miniStatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemEvent: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemConfidence: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
});
