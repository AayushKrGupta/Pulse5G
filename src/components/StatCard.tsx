import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ShadowCard } from "../../components/ui/ShadowCard";

export default function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <ShadowCard delay={0} index={0}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </ShadowCard>
  );
}

const styles = StyleSheet.create({
  inner: { padding: 20 },
  title: { fontSize: 13, color: "#94a3b8", fontWeight: "600", marginBottom: 4 },
  value: { fontSize: 26, fontWeight: "700", color: "#f8fafc" },
});
