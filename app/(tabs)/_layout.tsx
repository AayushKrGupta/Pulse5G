import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";

const TAB_BAR_HEIGHT = 64;
const FLOATING_MARGIN_H = 20;
const FLOATING_MARGIN_BOTTOM = 16;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#e5e5e5",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: [
          styles.tabBar,
          {
            position: "absolute",
            left: FLOATING_MARGIN_H,
            right: FLOATING_MARGIN_H,
            bottom: bottomInset + FLOATING_MARGIN_BOTTOM,
            height: TAB_BAR_HEIGHT,
            paddingTop: 10,
            paddingBottom: 10,
            justifyContent: "center",
            borderTopWidth: 0,
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
          },
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => <FloatingTabBarBackground />,
        tabBarButton: (props) => <HapticTab {...props} />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="alert-circle" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="stats-chart" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cameras"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="videocam" color={color} size={24} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function FloatingTabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "#1c1c1e",
          borderRadius: 28,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.45,
              shadowRadius: 20,
            },
            android: { elevation: 16 },
          }),
        },
      ]}
    />
  );
}

function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused?: boolean;
}) {
  const outlineName = `${name}-outline` as keyof typeof Ionicons.glyphMap;
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? name : outlineName}
        size={size}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {},
  tabItem: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
