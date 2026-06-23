import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAppState } from "@/hooks/useAppState";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

const features = [
  {
    icon: "layers" as const,
    title: "Unlimited Decks",
    description: "Generate as many name decks as you want, every day",
  },
  {
    icon: "rotate-ccw" as const,
    title: "Unlimited Undo",
    description: "Changed your mind? Undo any swipe, anytime",
  },
  {
    icon: "zap" as const,
    title: "75 Cards Per Deck",
    description: "3x more names in each deck for more choices",
  },
  {
    icon: "star" as const,
    title: "Ad-Free Experience",
    description: "No interruptions while browsing names",
  },
];

export default function PaywallScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { setPremium } = useAppState();

  const handlePurchase = () => {
    setPremium(true);
    navigation.goBack();
  };

  const handleRestore = () => {
    setPremium(true);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="star" size={40} color={Colors.light.buttonText} />
          </View>
          <ThemedText type="titleLarge" style={styles.title}>
            Unlock Premium
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Get unlimited access to find the perfect name
          </ThemedText>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <View key={feature.title} style={[styles.featureRow, { backgroundColor: theme.surface }]}>
              <View style={styles.featureIcon}>
                <Feather name={feature.icon} size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.featureText}>
                <ThemedText type="h4">{feature.title}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingContainer}>
          <View style={[styles.priceCard, styles.priceCardHighlighted]}>
            <View style={styles.popularBadge}>
              <ThemedText type="label" style={styles.popularText}>
                MOST POPULAR
              </ThemedText>
            </View>
            <ThemedText type="h2" style={styles.price}>
              $4.99
            </ThemedText>
            <ThemedText type="caption" style={styles.priceSubtext}>
              One-time purchase
            </ThemedText>
            <ThemedText type="caption" style={[styles.priceNote, { color: Colors.light.buttonText }]}>
              Lifetime access
            </ThemedText>
          </View>
        </View>

        <Button onPress={handlePurchase} style={styles.purchaseButton}>
          Unlock Premium
        </Button>

        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <ThemedText type="body" style={{ color: Colors.light.primary }}>
            Restore Purchase
          </ThemedText>
        </Pressable>

        <ThemedText type="caption" style={[styles.disclaimer, { color: theme.textTertiary }]}>
          This is a demo app. No actual purchase will be made.
        </ThemedText>
      </ScrollView>
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
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: Spacing["2xl"],
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  featureText: {
    flex: 1,
  },
  pricingContainer: {
    marginBottom: Spacing.xl,
  },
  priceCard: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  priceCardHighlighted: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  popularBadge: {
    backgroundColor: Colors.light.buttonText,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  popularText: {
    color: Colors.light.primary,
    fontWeight: "700",
  },
  price: {
    color: Colors.light.buttonText,
  },
  priceSubtext: {
    color: `${Colors.light.buttonText}CC`,
    marginTop: Spacing.xs,
  },
  priceNote: {
    marginTop: Spacing.md,
    fontWeight: "600",
  },
  purchaseButton: {
    marginBottom: Spacing.md,
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  disclaimer: {
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
