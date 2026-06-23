import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Colors, BorderRadius } from "@/constants/theme";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${Math.min(Math.max(progress, 0), 100)}%`, {
      damping: 20,
      stiffness: 100,
    }),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
  },
});
