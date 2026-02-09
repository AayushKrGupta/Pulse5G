import React from "react";
import { Platform, StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type ShadowCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  index?: number;
  entering?: any;
  light?: boolean; // light card on dark bg (like reference)
};

export function ShadowCard({
  children,
  style,
  delay = 0,
  index = 0,
  entering,
  light = false,
}: ShadowCardProps) {
  const defaultEntering = entering ?? FadeInDown.delay(delay + index * 60).springify();
  const cardStyle = [
    styles.card,
    light ? styles.cardLight : styles.cardDark,
    style,
  ];

  return (
    <Animated.View entering={defaultEntering} style={cardStyle}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cardDark: {
    backgroundColor: "#1c1c1e",
  },
  cardLight: {
    backgroundColor: "#f1f5f9", // slate-100
  },
});

export default ShadowCard;
