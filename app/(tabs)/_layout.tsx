import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getTabBarScreenOptions,
  TabBarIcon,
  TabBarItemWrapper,
} from "@/components/BottomTabBar";
import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);
  const tabBarOptions = getTabBarScreenOptions(bottomInset);

  return (
    <Tabs
      screenOptions={{
        ...tabBarOptions,
        tabBarButton: (props) => (
          <HapticTab {...props}>
            <TabBarItemWrapper focused={!!props.focused}>
              {props.children}
            </TabBarItemWrapper>
          </HapticTab>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          tabBarLabel: "Incidents",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="alert-circle" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarLabel: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="stats-chart" color={color} size={24} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cameras"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
