import { getCameras } from "@/src/services/api";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { ShadowCard } from "../../components/ui/ShadowCard";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";

export default function Cameras() {
  const insets = useSafeAreaInsets();
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    getCameras().then(setCameras).catch(() => setCameras([]));
  }, []);

  const list = cameras.length > 0 ? cameras : [
    { camera_id: "CAM-01", status: "Online", stream_quality: "HD" },
    { camera_id: "CAM-02", status: "Online", stream_quality: "HD" },
    { camera_id: "CAM-03", status: "Offline", stream_quality: "—" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { paddingHorizontal: 20 }]}
      >
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Cameras</Text>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#8e8e93" />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text
          entering={FadeInDown.delay(60).springify()}
          style={styles.sectionTitle}
        >
          Camera Status
        </Animated.Text>
        {list.map((cam, idx) => (
          <AnimatedListItem key={cam.camera_id ?? idx} index={idx}>
            <ShadowCard delay={0} index={idx} style={styles.cameraCard}>
              <View style={styles.cameraRow}>
                <View
                  style={[
                    styles.cameraIconWrap,
                    cam.status === "Online" ? styles.cameraIconOn : styles.cameraIconOff,
                  ]}
                >
                  <Ionicons
                    name="videocam"
                    size={22}
                    color={cam.status === "Online" ? "#22c55e" : "#64748b"}
                  />
                </View>
                <View style={styles.cameraContent}>
                  <Text style={styles.cameraId}>{cam.camera_id}</Text>
                  <Text style={styles.cameraMeta}>
                    {cam.status} · {cam.stream_quality}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    cam.status === "Online" ? styles.statusDotOn : styles.statusDotOff,
                  ]}
                />
              </View>
            </ShadowCard>
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
  headerSpacer: { width: 40, height: 40 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#e5e5e5" },
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e5e5e5",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  cameraCard: { marginBottom: 12 },
  cameraRow: { flexDirection: "row", alignItems: "center", padding: 4 },
  cameraIconWrap: { marginRight: 14 },
  cameraIconOn: {},
  cameraIconOff: {},
  cameraContent: { flex: 1 },
  cameraId: { fontSize: 16, fontWeight: "600", color: "#f8fafc" },
  cameraMeta: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotOn: { backgroundColor: "#22c55e" },
  statusDotOff: { backgroundColor: "#64748b" },
});
