import React from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { TagChip } from "@/components/TagChip";
import { ScoredName } from "@/models/types";
import { Colors, Shadows, BorderRadius, Spacing } from "@/constants/theme";
import { generateNameSummary } from "@/lib/nameSummary";

const CARD_WIDTH = Math.min(Dimensions.get("window").width - 48, 320);
const CARD_HEIGHT = 460;

interface NameCardProps {
  scoredName: ScoredName;
  onPress?: () => void;
}

export function NameCard({ scoredName, onPress }: NameCardProps) {
  const { record, reasons } = scoredName;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.content}>
        <ThemedText type="titleLarge" style={styles.name}>
          {record.name}
        </ThemedText>
        <ThemedText type="caption" style={styles.pronunciation}>
          {record.pronunciationHint}
        </ThemedText>

        <View style={styles.chipSection}>
          <View style={styles.chipRow}>
            {record.origins.slice(0, 3).map((origin) => (
              <TagChip key={origin} label={origin} />
            ))}
          </View>
          <View style={styles.chipRow}>
            {record.vibes.slice(0, 3).map((vibe) => (
              <TagChip key={vibe} label={vibe} />
            ))}
          </View>
        </View>

        <View style={styles.reasonsContainer}>
          <ThemedText type="label" style={styles.reasonsLabel}>
            Why this name?
          </ThemedText>
          <ThemedText type="body" style={styles.summaryText}>
            {generateNameSummary(record)}
          </ThemedText>
          {reasons.length > 0 ? (
            <View style={styles.reasonsList}>
              {reasons.map((reason, index) => (
                <View key={index} style={styles.reasonRow}>
                  <View style={styles.bullet} />
                  <ThemedText type="caption" style={styles.reasonText}>
                    {reason}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    ...Shadows.card,
  },
  content: {
    flex: 1,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  name: {
    textAlign: "center",
    color: Colors.light.text,
  },
  pronunciation: {
    textAlign: "center",
    color: Colors.light.textTertiary,
    marginTop: Spacing.sm,
  },
  chipSection: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  reasonsContainer: {
    marginTop: Spacing["2xl"],
    width: "100%",
    backgroundColor: `${Colors.light.primary}08`,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
  },
  reasonsLabel: {
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    color: Colors.light.text,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  reasonsList: {
    marginTop: Spacing.xs,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.light.primary,
    marginTop: 5,
    marginRight: Spacing.sm,
  },
  reasonText: {
    flex: 1,
    color: Colors.light.textSecondary,
  },
});
