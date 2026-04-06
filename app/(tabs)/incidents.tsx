import React, { useState, useCallback, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, ShieldCheck, Activity, Flame, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";
import { getLatestAlert } from "../../src/services/api";
import { Incident } from "../../src/types";

export default function IncidentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = Colors.dark;

  const loadIncidents = useCallback(async () => {
    try {
      const data = await getLatestAlert().catch(() => null);
      if (data && data.event === 'fire') {
        setIncidents(prev => {
          // Prevent duplicates based on timestamp
          const exists = prev.some(item => item.timestamp === data.timestamp);
          if (exists) return prev;
          return [data, ...prev];
        });
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
    // Poll for changes every 10 seconds for the history screen
    const interval = setInterval(loadIncidents, 10000);
    return () => clearInterval(interval);
  }, [loadIncidents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  }, [loadIncidents]);

  const renderItem = (item: Incident, index: number) => (
    <AnimatedListItem key={`${item.timestamp}-${index}`} index={index}>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <Flame size={32} color={theme.error} fill={theme.error} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemEvent, { color: theme.text }]} numberOfLines={1}>
            🔥 Fire Detected
          </Text>
          <View style={styles.conditionRow}>
            <View style={[styles.statusDot, { backgroundColor: theme.error }]} />
            <Text style={[styles.itemStatus, { color: theme.textSecondary }]} numberOfLines={1}>
              CRITICAL ALERT
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Calendar size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
              {new Date(Number(item.timestamp) * 1000).toLocaleString(undefined, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </Text>
          </View>
        </View>
        <View style={styles.itemMeta}>
          <View style={[styles.confidenceBadge, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
            <Text style={[styles.itemConfidence, { color: theme.accent }]}>
              {((item.confidence || 0) * 100).toFixed(0)}%
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
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Syncing with Edge VM...</Text>
          </View>
        ) : incidents.length > 0 ? (
          <>
            <View style={styles.statsOverview}>
              <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Activity size={16} color={theme.accent} />
                <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>Total: <Text style={{ color: theme.text, fontWeight: '700' }}>{incidents.length}</Text></Text>
              </View>
              <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <ShieldCheck size={16} color={theme.success} />
                <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>Edge Live</Text>
              </View>
            </View>

            {incidents.map((item, idx) => renderItem(item, idx))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.05)' }]}>
              <CheckCircle2 size={40} color={theme.success} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>All Clear</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No fire incidents have been recorded by the edge AI model yet.
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});
