import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAppState } from "@/hooks/useAppState";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { MainTabParamList } from "@/navigation/MainTabNavigator";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "SettingsTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    isPremium,
    includeNeutralInSettings,
    setIncludeNeutral,
    dailyLimits,
    buckets,
    resetAllData,
  } = useAppState();

  const handleUpgrade = () => {
    navigation.navigate("Paywall");
  };

  const handleStartOver = () => {
    Alert.alert(
      "Start Over",
      "This will clear all your saved names and preferences. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Over",
          style: "destructive",
          onPress: () => {
            resetAllData();
          },
        },
      ]
    );
  };

  const totalSavedNames = buckets.yes.length + buckets.maybe.length + buckets.no.length;
  const decksRemaining = isPremium ? "Unlimited" : `${3 - dailyLimits.deckGenerations} / 3`;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {!isPremium ? (
          <Pressable
            onPress={handleUpgrade}
            style={[styles.upgradeCard, { backgroundColor: Colors.light.primary }]}
          >
            <View style={styles.upgradeContent}>
              <Feather name="star" size={24} color={Colors.light.buttonText} />
              <View style={styles.upgradeText}>
                <ThemedText type="h4" style={{ color: Colors.light.buttonText }}>
                  Upgrade to Premium
                </ThemedText>
                <ThemedText type="caption" style={{ color: `${Colors.light.buttonText}CC` }}>
                  Unlimited decks, undo actions, and more
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.light.buttonText} />
          </Pressable>
        ) : (
          <View style={[styles.premiumBadge, { backgroundColor: `${Colors.light.primary}15` }]}>
            <Feather name="check-circle" size={20} color={Colors.light.primary} />
            <ThemedText type="body" style={[styles.premiumText, { color: Colors.light.primary }]}>
              Premium Member
            </ThemedText>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <ThemedText type="label" style={styles.sectionTitle}>
            Stats
          </ThemedText>
          <View style={styles.statRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Total Saved Names
            </ThemedText>
            <ThemedText type="h4">{totalSavedNames}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Favorites
            </ThemedText>
            <ThemedText type="h4">{buckets.yes.length}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Maybe
            </ThemedText>
            <ThemedText type="h4">{buckets.maybe.length}</ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Decks Remaining Today
            </ThemedText>
            <ThemedText type="h4">{decksRemaining}</ThemedText>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <ThemedText type="label" style={styles.sectionTitle}>
            Preferences
          </ThemedText>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="body">Include Gender-Neutral Names</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                Show gender-neutral options in new decks
              </ThemedText>
            </View>
            <Switch
              value={includeNeutralInSettings}
              onValueChange={setIncludeNeutral}
              trackColor={{ false: theme.border, true: Colors.light.primary }}
              thumbColor={theme.surface}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <ThemedText type="label" style={styles.sectionTitle}>
            Reset
          </ThemedText>
          <Pressable style={styles.dangerRow} onPress={handleStartOver}>
            <Feather name="refresh-ccw" size={18} color={Colors.light.accentNo} />
            <ThemedText type="body" style={{ color: Colors.light.accentNo, marginLeft: Spacing.sm }}>
              Start Over
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText type="caption" style={{ color: theme.textTertiary, textAlign: "center" }}>
            NameNest v1.0.0
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary, textAlign: "center", marginTop: 4 }}>
            Made with care for expecting parents
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  upgradeText: {
    marginLeft: Spacing.md,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  premiumText: {
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  sectionTitle: {
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
    textTransform: "uppercase",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
});
