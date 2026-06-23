import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface TagChipProps {
  label: string;
  style?: ViewStyle;
  variant?: "default" | "origin" | "vibe";
}

export function TagChip({ label, style, variant = "default" }: TagChipProps) {
  return (
    <View style={[styles.chip, style]}>
      <ThemedText type="label" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 28,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.light.primary}15`,
    borderWidth: 1,
    borderColor: `${Colors.light.primary}4D`,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  label: {
    color: Colors.light.primary,
    fontSize: 11,
    textTransform: "uppercase",
  },
});
