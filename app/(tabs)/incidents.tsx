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
import { 
  ChevronLeft, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Flame, 
  CheckCircle2, 
  AlertTriangle,
  PersonStanding,
  Accessibility,
  Trash2
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
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
  const HISTORY_KEY = 'pulse5g_incident_history';

  // 1. Load history from SecureStore on mount
  useEffect(() => {
    const loadStoredHistory = async () => {
      try {
        const stored = await SecureStore.getItemAsync(HISTORY_KEY);
        if (stored) {
          setIncidents(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredHistory();
  }, []);

  // 2. Save history to SecureStore whenever incidents change
  useEffect(() => {
    const saveHistory = async () => {
      try {
        const dataToSave = JSON.stringify(incidents);
        // SecureStore has a 2048 byte limit. If we exceed it, keep only recent ones.
        if (dataToSave.length > 2000) {
          const truncated = incidents.slice(0, Math.floor(incidents.length / 2));
          await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(truncated));
        } else {
          await SecureStore.setItemAsync(HISTORY_KEY, dataToSave);
        }
      } catch (err) {
        console.error("Failed to save history:", err);
      }
    };
    if (incidents.length > 0) {
      saveHistory();
    }
  }, [incidents]);

  const loadIncidents = useCallback(async () => {
    try {
      const data = await getLatestAlert().catch(() => null);
      if (data && data.event !== 'none') {
        // 🔥 FILTER: Only keep incidents with confidence > 60%
        if (data.confidence !== undefined && data.confidence < 0.6) {
          console.log("⏭️ Skipping low confidence incident history:", data.confidence);
          return;
        }

        setIncidents(prev => {
          // Prevent duplicates based on exact timestamp
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
    // Poll for changes every 1 second for instant history updates
    const interval = setInterval(loadIncidents, 1000);
    return () => clearInterval(interval);
  }, [loadIncidents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  }, [loadIncidents]);

  const clearHistory = async () => {
    try {
      await SecureStore.deleteItemAsync(HISTORY_KEY);
      setIncidents([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const getEventData = (event: string) => {
    switch (event.toLowerCase()) {
      case 'fire':
        return { label: '🔥 Fire Detected', icon: Flame, color: '#DC2626', status: 'CRITICAL' };
      case 'fall':
        return { label: '⚠️ Fall Detected', icon: AlertTriangle, color: '#F97316', status: 'HAZARD' };
      case 'running':
        return { label: '🏃 Running Detected', icon: Accessibility, color: '#10B981', status: 'ACTIVE' };
      case 'stand':
        return { label: '🧍 Standing Detected', icon: PersonStanding, color: '#3B82F6', status: 'NORMAL' };
      default:
        return { 
          label: event.charAt(0).toUpperCase() + event.slice(1), 
          icon: Activity, 
          color: '#3B82F6', 
          status: 'EVENT' 
        };
    }
  };

  const renderItem = (item: Incident, index: number) => {
    const { label, icon: IconComponent, color, status } = getEventData(item.event);

    return (
      <AnimatedListItem key={`${item.timestamp}-${index}`} index={index}>
        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <IconComponent size={32} color={color} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemEvent, { color: theme.text }]} numberOfLines={1}>
              {label}
            </Text>
            <View style={styles.conditionRow}>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <Text style={[styles.itemStatus, { color: theme.textSecondary }]} numberOfLines={1}>
                {status}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <Calendar size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
                {new Date(typeof item.timestamp === 'number' && item.timestamp < 1e12 ? item.timestamp * 1000 : item.timestamp).toLocaleString(undefined, { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          <View style={styles.itemMeta}>
            {item.confidence && (
              <View style={[styles.confidenceBadge, { backgroundColor: `${color}10` }]}>
                <Text style={[styles.itemConfidence, { color: color }]}>
                  {(item.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </AnimatedListItem>
    );
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Activity History</Text>
        <TouchableOpacity 
          onPress={clearHistory}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <Trash2 size={20} color={theme.error} />
        </TouchableOpacity>
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
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Syncing with Edge AI...</Text>
          </View>
        ) : incidents.length > 0 ? (
          <>
            <View style={styles.statsOverview}>
              <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Activity size={16} color={theme.accent} />
                <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>Logs: <Text style={{ color: theme.text, fontWeight: '700' }}>{incidents.length}</Text></Text>
              </View>
              <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <ShieldCheck size={16} color={theme.success} />
                <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>Edge Node Live</Text>
              </View>
            </View>

            {incidents.map((item, idx) => renderItem(item, idx))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.05)' }]}>
              <CheckCircle2 size={40} color={theme.success} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Monitoring Active</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              The Edge AI is currently monitoring for falls and activities. No significant incidents recorded yet.
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
    width: 62,
    height: 62,
    borderRadius: 18,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemEvent: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  itemConfidence: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
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
