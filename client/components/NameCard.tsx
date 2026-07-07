import React from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { TagChip } from "@/components/TagChip";
import { ScoredName } from "@/models/types";
import { Colors, Shadows, BorderRadius, Spacing } from "@/constants/theme";
import { generateNameSummary } from "@/lib/nameSummary";

const CARD_WIDTH = Math.min(Dimensions.get("window").width - 48, 320);
const CARD_HEIGHT = 500;

interface NameCardProps {
  scoredName: ScoredName;
  onPress?: () => void;
}

export function NameCard({ scoredName, onPress }: NameCardProps) {
  const { record, reasons } = scoredName;

  // Natural-language teaser blurb (1-2 sentences) — the hook
  const summary = generateNameSummary(record);

  // Top 2 reasons as quick highlights (truncated for card space)
  const topReasons = reasons.slice(0, 2);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.content}>
        {/* Name + pronunciation */}
        <ThemedText type="titleLarge" style={styles.name}>
          {record.name}
        </ThemedText>
        {record.pronunciationHint ? (
          <ThemedText type="caption" style={styles.pronunciation}>
            {record.pronunciationHint}
          </ThemedText>
        ) : null}

        {/* Teaser blurb — the hook */}
        <View style={styles.blurbSection}>
          <ThemedText type="body" style={styles.blurb}>
            {summary}
          </ThemedText>
        </View>

        {/* Quick highlights — why this name matched */}
        {topReasons.length > 0 ? (
          <View style={styles.highlightsSection}>
            {topReasons.map((reason, index) => (
              <View key={index} style={styles.highlightRow}>
                <View style={styles.bullet} />
                <ThemedText type="caption" style={styles.highlightText}>
                  {reason.length > 80 ? reason.slice(0, 77) + "..." : reason}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        {/* Tags */}
        <View style={styles.chipSection}>
          <View style={styles.chipRow}>
            {record.origins.slice(0, 3).map((origin) => (
              <TagChip key={origin} label={origin} />
            ))}
            {record.vibes.slice(0, 3).map((vibe) => (
              <TagChip key={vibe} label={vibe} />
            ))}
          </View>
        </View>

        {/* Tap hint at bottom */}
        <View style={styles.tapHint}>
          <Feather name="info" size={12} color={Colors.light.textTertiary} />
          <ThemedText type="caption" style={styles.tapHintText}>
            Tap for more details
          </ThemedText>
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
    justifyContent: "space-between",
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
  blurbSection: {
    marginTop: Spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  blurb: {
    textAlign: "center",
    color: Colors.light.text,
    lineHeight: 23,
    fontSize: 15,
    fontStyle: "italic",
  },
  highlightsSection: {
    marginTop: Spacing.lg,
    width: "100%",
    backgroundColor: `${Colors.light.primary}08`,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  highlightRow: {
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
  highlightText: {
    flex: 1,
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },
  chipSection: {
    alignItems: "center",
    width: "100%",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.6,
  },
  tapHintText: {
    color: Colors.light.textTertiary,
    fontSize: 11,
  },
});
