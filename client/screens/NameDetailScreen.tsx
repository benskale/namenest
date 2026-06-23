import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TagChip } from "@/components/TagChip";
import { ActionButton } from "@/components/ActionButton";
import { useTheme } from "@/hooks/useTheme";
import { useAppState } from "@/hooks/useAppState";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { BucketType } from "@/models/types";
import { getMiddleNameSuggestions } from "@/services/RecommendationEngine";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "NameDetail">;

export default function NameDetailScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { addToBucket, moveBetweenBuckets, buckets } = useAppState();

  const { scoredName, fromBucket } = route.params;
  const { record, reasons } = scoredName;

  const currentBucket = useMemo(() => {
    if (buckets.yes.includes(record.id)) return "yes";
    if (buckets.maybe.includes(record.id)) return "maybe";
    if (buckets.no.includes(record.id)) return "no";
    return null;
  }, [buckets, record.id]);

  const middleNameSuggestions = useMemo(() => {
    return getMiddleNameSuggestions(record).slice(0, 5);
  }, [record]);

  const handleAction = (bucket: BucketType) => {
    if (currentBucket) {
      moveBetweenBuckets(currentBucket, bucket, record.id);
    } else {
      addToBucket(bucket, record.id);
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <ThemedText type="hero" style={styles.name}>
            {record.name}
          </ThemedText>
          <ThemedText type="body" style={[styles.pronunciation, { color: theme.textSecondary }]}>
            {record.pronunciationHint || `${record.syllables} syllable${record.syllables > 1 ? "s" : ""}`}
          </ThemedText>
          <View style={styles.genderBadge}>
            <Feather
              name={record.gender === "boy" ? "user" : record.gender === "girl" ? "user" : "users"}
              size={14}
              color={Colors.light.primary}
            />
            <ThemedText type="label" style={styles.genderText}>
              {record.gender === "boy" ? "Boy" : record.gender === "girl" ? "Girl" : "Gender-Neutral"}
            </ThemedText>
          </View>
        </View>

        {reasons.length > 0 ? (
          <View style={[styles.section, { backgroundColor: `${Colors.light.primary}10` }]}>
            <ThemedText type="label" style={[styles.sectionLabel, { color: Colors.light.primary }]}>
              Why This Name?
            </ThemedText>
            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <View style={styles.bullet} />
                <ThemedText type="body">{reason}</ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        {record.meaning ? (
          <View style={styles.section}>
            <ThemedText type="label" style={styles.sectionLabel}>
              Meaning
            </ThemedText>
            <ThemedText type="body" style={styles.meaningText}>
              {record.meaning}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="label" style={styles.sectionLabel}>
            {record.meaning ? "Themes" : "Meaning"}
          </ThemedText>
          <View style={styles.tagRow}>
            {record.meaningKeywords.length > 0 ? (
              record.meaningKeywords.map((keyword) => (
                <TagChip key={keyword} label={keyword} />
              ))
            ) : (
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                No themes tagged
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" style={styles.sectionLabel}>
            Origins
          </ThemedText>
          <View style={styles.tagRow}>
            {record.origins.map((origin) => (
              <TagChip key={origin} label={origin} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" style={styles.sectionLabel}>
            Style & Vibe
          </ThemedText>
          <View style={styles.tagRow}>
            {record.vibes.map((vibe) => (
              <TagChip key={vibe} label={vibe} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" style={styles.sectionLabel}>
            Details
          </ThemedText>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                Syllables
              </ThemedText>
              <ThemedText type="h4">{record.syllables}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                Popularity
              </ThemedText>
              <ThemedText type="h4">
                {record.popularityTier <= 2 ? "Popular" : record.popularityTier >= 4 ? "Unique" : "Moderate"}
              </ThemedText>
            </View>
          </View>
        </View>

        {record.nicknames.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="label" style={styles.sectionLabel}>
              Nicknames
            </ThemedText>
            <View style={styles.tagRow}>
              {record.nicknames.map((nickname) => (
                <TagChip key={nickname} label={nickname} />
              ))}
            </View>
          </View>
        ) : null}

        {record.variants.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="label" style={styles.sectionLabel}>
              Variants
            </ThemedText>
            <View style={styles.tagRow}>
              {record.variants.map((variant) => (
                <TagChip key={variant} label={variant} />
              ))}
            </View>
          </View>
        ) : null}

        {middleNameSuggestions.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="label" style={styles.sectionLabel}>
              Middle Name Ideas
            </ThemedText>
            <View style={styles.middleNamesRow}>
              {middleNameSuggestions.map((suggestion) => (
                <View key={suggestion.id} style={styles.middleNameChip}>
                  <ThemedText type="body" style={styles.middleNameText}>
                    {record.name} {suggestion.name}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.actionsRow}>
          <ActionButton type="no" onPress={() => handleAction("no")} />
          <ActionButton type="maybe" onPress={() => handleAction("maybe")} />
          <ActionButton type="yes" onPress={() => handleAction("yes")} />
        </View>
        {currentBucket ? (
          <ThemedText type="caption" style={[styles.currentBucketText, { color: theme.textTertiary }]}>
            Currently in: {currentBucket.charAt(0).toUpperCase() + currentBucket.slice(1)}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing["2xl"],
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  name: {
    textAlign: "center",
  },
  pronunciation: {
    marginTop: Spacing.sm,
  },
  genderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.primary}15`,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  genderText: {
    color: Colors.light.primary,
    marginLeft: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.subtle,
  },
  sectionLabel: {
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  meaningText: {
    lineHeight: 22,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  detailsGrid: {
    flexDirection: "row",
  },
  detailItem: {
    flex: 1,
  },
  middleNamesRow: {
    gap: Spacing.sm,
  },
  middleNameChip: {
    backgroundColor: `${Colors.light.primary}10`,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  middleNameText: {
    color: Colors.light.primary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
    ...Shadows.card,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  currentBucketText: {
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
