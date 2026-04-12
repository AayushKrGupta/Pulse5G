import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from "react-native";

/**
 * Spotify-inspired Bottom Navigation Bar
 * Optimized for Pulse 5G with Yellow Accent
 */

export const TAB_BAR_CONFIG = {
  activeTintColor: '#FFFFFF',
  inactiveTintColor: '#B3B3B3',
  accentColor: '#EAB308',
  backgroundColor: 'transparent',
} as const;

export function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)', 'rgba(0,0,0,1)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      {Platform.OS === 'ios' && (
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
}

export type TabBarIconProps = {
  name: string;
  color: string;
  size?: number;
  focused?: boolean;
};

export function TabBarIcon({ name, color, size = 24, focused }: TabBarIconProps) {
  // Map Ionicons names to Lucide names if needed, or just use the name directly
  // Common mapping for Pulse 5G:
  const iconMap: Record<string, any> = {
    'home': LucideIcons.Home,
    'alert-circle': LucideIcons.AlertCircle,
    'stats-chart': LucideIcons.Activity,
    'camera': LucideIcons.Camera,
    'wifi': LucideIcons.Wifi,
  };

  const IconComponent = iconMap[name] || LucideIcons.HelpCircle;

  return (
    <IconComponent
      size={size}
      color={focused ? TAB_BAR_CONFIG.accentColor : color}
      strokeWidth={focused ? 2.5 : 2}
    />
  );
}

export function TabBarItemWrapper({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return <View style={styles.itemWrapper}>{children}</View>;
}

export function getTabBarScreenOptions(bottomInset: number) {
  return {
    headerShown: false,
    tabBarActiveTintColor: TAB_BAR_CONFIG.activeTintColor,
    tabBarInactiveTintColor: TAB_BAR_CONFIG.inactiveTintColor,
    tabBarStyle: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: Platform.OS === 'ios' ? 88 : 72,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      elevation: 0,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    },
    tabBarBackground: () => <TabBarBackground />,
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '600' as const,
      marginTop: 4,
    },
  };
}

const styles = StyleSheet.create({
  itemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
