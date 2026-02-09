import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

type AnimatedListItemProps = {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle;
};

export function AnimatedListItem({ children, index, style }: AnimatedListItemProps) {
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      style={[styles.container, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
