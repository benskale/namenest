import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { TagChip } from "@/components/TagChip";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAppState } from "@/hooks/useAppState";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { BucketType, NameRecord } from "@/models/types";
import { getNameById } from "@/services/RecommendationEngine";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { MainTabParamList } from "@/navigation/MainTabNavigator";

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "BucketsTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabType = "yes" | "maybe" | "no";

const tabs: { key: TabType; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "yes", label: "Yes", icon: "heart" },
  { key: "maybe", label: "Maybe", icon: "star" },
  { key: "no", label: "No", icon: "x" },
];

export default function BucketsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { buckets, moveBetweenBuckets, removeFromBucket } = useAppState();

  const [activeTab, setActiveTab] = useState<TabType>("yes");

  const currentBucketIds = buckets[activeTab];
  const currentBucketNames = useMemo(() => {
    return currentBucketIds
      .map((id) => getNameById(id))
      .filter((name): name is NameRecord => name !== undefined);
  }, [currentBucketIds]);

  const handleNamePress = useCallback((name: NameRecord) => {
    navigation.navigate("NameDetail", {
      scoredName: { record: name, score: 0, reasons: [] },
      fromBucket: true,
    });
  }, [navigation]);

  const handleMove = useCallback((nameId: string, to: BucketType) => {
    moveBetweenBuckets(activeTab, to, nameId);
  }, [activeTab, moveBetweenBuckets]);

  const handleRemove = useCallback((nameId: string) => {
    removeFromBucket(activeTab, nameId);
  }, [activeTab, removeFromBucket]);

  const renderItem = useCallback(({ item }: { item: NameRecord }) => (
    <NameListItem
      name={item}
      bucket={activeTab}
      onPress={() => handleNamePress(item)}
      onMove={handleMove}
      onRemove={handleRemove}
    />
  ), [activeTab, handleNamePress, handleMove, handleRemove]);

  const renderEmpty = () => {
    const emptyMessages: Record<TabType, { title: string; subtitle: string }> = {
      yes: {
        title: "No favorites yet",
        subtitle: "Swipe right on names you love to add them here",
      },
      maybe: {
        title: "Nothing in maybe",
        subtitle: "Swipe up on names you're considering to save them here",
      },
      no: {
        title: "No rejected names",
        subtitle: "Swipe left to move names you don't like here",
      },
    };

    return (
      <EmptyState
        image={require("../../assets/images/empty-bucket.png")}
        title={emptyMessages[activeTab].title}
        subtitle={emptyMessages[activeTab].subtitle}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
          >
            <Feather
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? Colors.light.primary : theme.textSecondary}
            />
            <ThemedText
              type="label"
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? Colors.light.primary : theme.textSecondary },
              ]}
            >
              {tab.label} ({buckets[tab.key].length})
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={currentBucketNames}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
          currentBucketNames.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

interface NameListItemProps {
  name: NameRecord;
  bucket: BucketType;
  onPress: () => void;
  onMove: (nameId: string, to: BucketType) => void;
  onRemove: (nameId: string) => void;
}

function NameListItem({ name, bucket, onPress, onMove, onRemove }: NameListItemProps) {
  const { theme } = useTheme();
  const [showActions, setShowActions] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => setShowActions(!showActions)}
      style={[styles.listItem, { backgroundColor: theme.surface }]}
    >
      <View style={styles.listItemContent}>
        <View style={styles.listItemMain}>
          <ThemedText type="h4" style={styles.listItemName}>
            {name.name}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textTertiary }}>
            {name.pronunciationHint}
          </ThemedText>
        </View>
        <View style={styles.listItemTags}>
          {name.origins.slice(0, 2).map((origin) => (
            <TagChip key={origin} label={origin} />
          ))}
        </View>
      </View>
      
      {showActions ? (
        <View style={styles.actionsRow}>
          {bucket !== "yes" ? (
            <Pressable
              onPress={() => { onMove(name.id, "yes"); setShowActions(false); }}
              style={[styles.actionChip, { backgroundColor: `${Colors.light.accentYes}20` }]}
            >
              <Feather name="heart" size={14} color={Colors.light.accentYes} />
              <ThemedText type="label" style={{ color: Colors.light.accentYes, marginLeft: 4 }}>
                Yes
              </ThemedText>
            </Pressable>
          ) : null}
          {bucket !== "maybe" ? (
            <Pressable
              onPress={() => { onMove(name.id, "maybe"); setShowActions(false); }}
              style={[styles.actionChip, { backgroundColor: `${Colors.light.accentMaybe}20` }]}
            >
              <Feather name="star" size={14} color={Colors.light.accentMaybe} />
              <ThemedText type="label" style={{ color: Colors.light.accentMaybe, marginLeft: 4 }}>
                Maybe
              </ThemedText>
            </Pressable>
          ) : null}
          {bucket !== "no" ? (
            <Pressable
              onPress={() => { onMove(name.id, "no"); setShowActions(false); }}
              style={[styles.actionChip, { backgroundColor: `${Colors.light.accentNo}20` }]}
            >
              <Feather name="x" size={14} color={Colors.light.accentNo} />
              <ThemedText type="label" style={{ color: Colors.light.accentNo, marginLeft: 4 }}>
                No
              </ThemedText>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => { onRemove(name.id); setShowActions(false); }}
            style={[styles.actionChip, { backgroundColor: theme.backgroundTertiary }]}
          >
            <Feather name="trash-2" size={14} color={theme.textTertiary} />
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tabActive: {
    backgroundColor: `${Colors.light.primary}15`,
  },
  tabLabel: {
    marginLeft: Spacing.xs,
  },
  listContent: {
    padding: Spacing.lg,
  },
  emptyListContent: {
    flex: 1,
  },
  listItem: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemMain: {
    flex: 1,
  },
  listItemName: {
    marginBottom: 2,
  },
  listItemTags: {
    flexDirection: "row",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
});
