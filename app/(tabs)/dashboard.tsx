import { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import AlertCard from "../../src/components/AlertCard";
import { connectAlertsSocket } from "../../src/services/websocket";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_GAP = 14;
const BOTTOM_PADDING = 120;

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<any[]>([]);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    const ws = connectAlertsSocket((data) => {
      setAlerts((prev) => [data, ...prev]);
    });
    return () => ws.close();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header: three dots + profile */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { paddingHorizontal: 20 }]}
      >
        <View style={styles.headerSpacer} />
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#8e8e93" />
        </View>
      </Animated.View>

      {/* Title block: Pulse 5G + Dashboard */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={[styles.titleBlock, { paddingHorizontal: 20 }]}
      >
        <Text style={styles.brandTitle}>Pulse 5G</Text>
        <Text style={styles.sectionSubtitle}>Dashboard</Text>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + BOTTOM_PADDING },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Big payment-style cards */}
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
          style={styles.cardsScroll}
        >
          <PaymentCard
            index={0}
            scrollX={scrollX}
            label="NETWORK"
            value="5G Edge"
            sub="Active"
            bg="#eef2f6"
            textColor="#3d3d3d"
          />
          <PaymentCard
            index={1}
            scrollX={scrollX}
            label="ALERTS"
            value={String(alerts.length)}
            sub="Live"
            bg="#e8e0f0"
            textColor="#3d3d3d"
          />
        </Animated.ScrollView>

        {/* Transaction-style list: Latest Alerts */}
        {alerts.length === 0 ? (
          <>
            <AnimatedListItem index={0}>
              <AlertCard
                incident={{
                  event: "No incidents detected",
                  confidence: 0,
                  timestamp: "Waiting for live data",
                  severity: "warning",
                }}
              />
            </AnimatedListItem>
            <AnimatedListItem index={1}>
              <AlertCard
                incident={{
                  event: "System Monitoring Active",
                  confidence: 1,
                  timestamp: "5G Edge Connected",
                  severity: "info",
                }}
              />
            </AnimatedListItem>
          </>
        ) : (
          alerts.map((item, idx) => (
            <AnimatedListItem key={idx} index={idx}>
              <AlertCard incident={item} />
            </AnimatedListItem>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function PaymentCard({
  index,
  scrollX,
  label,
  value,
  sub,
  bg,
  textColor,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
  label: string;
  value: string;
  sub: string;
  bg: string;
  textColor: string;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_GAP),
      index * (CARD_WIDTH + CARD_GAP),
      (index + 1) * (CARD_WIDTH + CARD_GAP),
    ];
    const scale = interpolate(scrollX.value, inputRange, [0.92, 1, 0.92]);
    const opacity = interpolate(scrollX.value, inputRange, [0.88, 1, 0.88]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View
      style={[
        styles.paymentCard,
        { width: CARD_WIDTH, backgroundColor: bg },
        animatedStyle,
      ]}
    >
      <View style={styles.paymentCardTop}>
        <View style={[styles.cardToggle, { backgroundColor: textColor }]} />
      </View>
      <Text style={[styles.paymentLabel, { color: `${textColor}99` }]}>
        {label}
      </Text>
      <Text style={[styles.paymentValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.paymentSub, { color: `${textColor}cc` }]}>{sub}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingVertical: 8,
  },
  headerSpacer: { width: 40, height: 40 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c1c1e",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8e8e93",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 0 },
  cardsScroll: { marginHorizontal: -20 },
  cardsRow: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: CARD_GAP,
  },
  paymentCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 180,
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: { elevation: 14 },
    }),
  },
  paymentCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardToggle: {
    width: 36,
    height: 22,
    borderRadius: 11,
    opacity: 0.3,
  },
  paymentLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginTop: 8,
  },
  paymentValue: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  paymentSub: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 4,
  },
});
