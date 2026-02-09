import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

// ─── Customize these to match the reference UI ──────────────────────────────

export const TAB_BAR_CONFIG = {
  height: 68,
  marginHorizontalPercent: 18,
  marginBottom: 24,
  paddingVertical: 10,
  paddingHorizontal: 6,
  backgroundColor: "#1c1c1e",
  activeTintColor: "#EAB308",
  inactiveTintColor: "#e5e5e5",
  activeItemBackground: "#713F12",
  iconSize: 24,
  iconWrapSize: 40,
  labelFontSize: 11,
  labelActiveColor: "#EAB308",
  labelInactiveColor: "#9ca3af",
  itemPaddingVertical: 8,
  itemPaddingHorizontal: 12,
  itemBorderRadius: 16,
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 20,
    },
    android: { elevation: 16 },
  }),
} as const;


// ─── Floating background (pill shape: semicircle on both ends) ───────────────

export function TabBarBackground() {
  const { height, backgroundColor, shadow } = TAB_BAR_CONFIG;
  const borderRadius = height / 2;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor,
          borderRadius,
          ...shadow,
        },
      ]}
    />
  );
}


// ─── Icon with optional active-state wrapper ───────────────────────────────

export type TabBarIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
  focused?: boolean;
};

export function TabBarIcon({ name, color, size, focused }: TabBarIconProps) {
  const outlineName = `${name}-outline` as keyof typeof Ionicons.glyphMap;
  const iconSize = size ?? TAB_BAR_CONFIG.iconSize;
  const { iconWrapSize } = TAB_BAR_CONFIG;

  return (
    <View style={[styles.iconWrap, { width: iconWrapSize, height: iconWrapSize }]}>
      <Ionicons
        name={focused ? name : outlineName}
        size={iconSize}
        color={color}
      />
    </View>
  );
}

// ─── Wraps icon + label with rounded background when active ─────────────────

type TabBarItemWrapperProps = {
  focused: boolean;
  children: React.ReactNode;
};

export function TabBarItemWrapper({ focused, children }: TabBarItemWrapperProps) {
  const { activeItemBackground, itemPaddingVertical, itemPaddingHorizontal, itemBorderRadius } =
    TAB_BAR_CONFIG;

  const wrapperStyle: ViewStyle = {
    paddingVertical: itemPaddingVertical,
    paddingHorizontal: itemPaddingHorizontal,
    borderRadius: itemBorderRadius,
    alignItems: "center",
    justifyContent: "center",
    ...(focused && { backgroundColor: activeItemBackground }),
  };

  return <View style={wrapperStyle}>{children}</View>;
}


// ─── Screen options for Tabs (floating, centered, with labels) ─────────────

export function getTabBarScreenOptions(bottomInset: number) {
  const {
    height,
    marginBottom,
    marginHorizontalPercent,
    paddingVertical,
    paddingHorizontal,
    activeTintColor,
    inactiveTintColor,
    labelFontSize,
  } = TAB_BAR_CONFIG;

  const bottom = bottomInset + marginBottom;
  const leftRight = `${marginHorizontalPercent}%`;

  return {
    headerShown: false,
    tabBarShowLabel: true,
    tabBarActiveTintColor: activeTintColor,
    tabBarInactiveTintColor: inactiveTintColor,
    tabBarLabelStyle: {
      fontSize: labelFontSize,
      fontWeight: "500",
    },
    tabBarStyle: [
      styles.tabBar,
      {
        position: "absolute" as const,
        left: leftRight,
        right: leftRight,
        bottom,
        height,
        paddingVertical,
        paddingHorizontal,
        borderTopWidth: 0,
        backgroundColor: "transparent",
        elevation: 0,
        shadowOpacity: 0,
      },
    ],
    tabBarItemStyle: styles.tabItem,
    tabBarBackground: () => <TabBarBackground />,
  };
}


// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },

  tabItem: {
    flex: 1,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
