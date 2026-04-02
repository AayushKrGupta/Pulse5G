import React from "react";
import { Platform, StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "../../constants/theme";

type ShadowCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  index?: number;
  entering?: any;
  light?: boolean;
};

export function ShadowCard({
  children,
  style,
  delay = 0,
  index = 0,
  entering,
  light = false,
}: ShadowCardProps) {
  const theme = Colors.dark;
  const defaultEntering = entering ?? FadeInDown.delay(delay + index * 60).springify();
  
  const cardStyle = [
    styles.card,
    { 
      backgroundColor: light ? Colors.light.card : theme.card,
      borderColor: light ? Colors.light.cardBorder : theme.cardBorder,
      borderWidth: 1.5,
    },
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
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

export default ShadowCard;
