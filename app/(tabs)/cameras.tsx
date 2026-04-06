import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, Activity, Wifi, WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getCameras, getVideoStreamUrl } from "../../src/services/api";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";
import { ShadowCard } from "../../components/ui/ShadowCard";
import LiveVideoStream from "../../src/components/LiveVideoStream";

// const { width } = Dimensions.get('window');

export default function CamerasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cameras, setCameras] = useState<any[]>([]);
  const theme = Colors.dark;

  useEffect(() => {
    getCameras().then(setCameras).catch(() => setCameras([]));
  }, []);

  const list = cameras.length > 0 ? cameras : [
    { camera_id: "CAM-01", status: "Online", stream_quality: "4K Edge" },
    { camera_id: "CAM-02", status: "Online", stream_quality: "High Dep" },
    { camera_id: "CAM-03", status: "Offline", stream_quality: "—" },
    { camera_id: "CAM-04", status: "Online", stream_quality: "HD Stream" },
  ];

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Connected Cameras</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.statsOverview}>
          <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Activity size={16} color={theme.accent} />
            <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>Total: <Text style={{ color: theme.text, fontWeight: '700' }}>{list.length}</Text></Text>
          </View>
          <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <ShieldCheck size={16} color={theme.success} />
            <Text style={[styles.miniStatText, { color: theme.textSecondary }]}>Secure Stream</Text>
          </View>
        </View>

        {/* Live Video Stream */}
        <View style={styles.videoSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Primary Camera Feed</Text>
          <LiveVideoStream cameraId="CAM-01" />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Monitoring Nodes</Text>

        {list.map((cam, idx) => (
          <AnimatedListItem key={cam.camera_id ?? idx} index={idx}>
            <ShadowCard delay={0} index={idx} style={Object.assign({}, styles.cameraCard, { backgroundColor: theme.card, borderColor: theme.cardBorder })}>
              <View style={styles.cameraRow}>
                <View style={[styles.iconContainer, { backgroundColor: cam.status === 'Online' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                  {cam.status === 'Online' ? (
                    <Wifi size={24} color={theme.success} />
                  ) : (
                    <WifiOff size={24} color={theme.error} />
                  )}
                </View>
                <View style={styles.cameraInfo}>
                  <Text style={[styles.cameraId, { color: theme.text }]}>{cam.camera_id}</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: cam.status === 'Online' ? theme.success : theme.error }]} />
                    <Text style={[styles.statusText, { color: theme.textSecondary }]}>{cam.status}</Text>
                    <Text style={[styles.qualityText, { color: theme.textSecondary }]}> • {cam.stream_quality}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.viewButton, { backgroundColor: theme.accent }]}>
                  <Text style={styles.viewButtonText}>VIEW</Text>
                </TouchableOpacity>
              </View>
            </ShadowCard>
          </AnimatedListItem>
        ))}
        
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  cameraCard: {
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  cameraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cameraInfo: {
    flex: 1,
  },
  cameraId: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  videoSection: {
    marginBottom: 24,
  },
});
