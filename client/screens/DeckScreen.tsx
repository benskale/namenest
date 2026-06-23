import React, { useCallback, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { NameCard } from "@/components/NameCard";
import { ActionButton } from "@/components/ActionButton";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAppState } from "@/hooks/useAppState";
import { Colors, Spacing } from "@/constants/theme";
import { BucketType, ScoredName } from "@/models/types";
import { generateDeck, generateDeckAI } from "@/services/RecommendationEngine";
import type { FamilyTreeData } from "@/models/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { MainTabParamList } from "@/navigation/MainTabNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_VELOCITY = 500;

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "DeckTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function DeckScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    currentDeck,
    currentDeckIndex,
    nextCard,
    addToBucket,
    removeFromBucket,
    pushUndo,
    popUndo,
    canUndo,
    buckets,
    answers,
    setDeck,
    canGenerateDeck,
    incrementDeckGeneration,
    isPremium,
  } = useAppState();

  const [showPaywall, setShowPaywall] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  const currentCard = currentDeck[currentDeckIndex];
  const nextCardPreview = currentDeck[currentDeckIndex + 1];
  const cardsRemaining = currentDeck.length - currentDeckIndex;
  const isDeckEmpty = cardsRemaining <= 0;

  const performSwipe = useCallback((bucket: BucketType) => {
    if (!currentCard) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToBucket(bucket, currentCard.record.id);
    pushUndo({
      nameId: currentCard.record.id,
      previousDeckIndex: currentDeckIndex,
      bucketAddedTo: bucket,
      timestamp: Date.now(),
    });
    nextCard();
  }, [currentCard, currentDeckIndex, addToBucket, pushUndo, nextCard]);

  const animateSwipe = useCallback((direction: "left" | "right" | "up") => {
    const targetX = direction === "left" ? -SCREEN_WIDTH : direction === "right" ? SCREEN_WIDTH : 0;
    const targetY = direction === "up" ? -500 : 0;
    
    translateX.value = withSpring(targetX, { damping: 20 });
    translateY.value = withSpring(targetY, { damping: 20 });
    rotation.value = withSpring(direction === "left" ? -15 : direction === "right" ? 15 : 0);
    
    setTimeout(() => {
      translateX.value = 0;
      translateY.value = 0;
      rotation.value = 0;
    }, 300);
  }, [translateX, translateY, rotation]);

  const handleSwipeComplete = useCallback((direction: "left" | "right" | "up") => {
    const bucket = direction === "left" ? "no" : direction === "right" ? "yes" : "maybe";
    animateSwipe(direction);
    performSwipe(bucket);
  }, [animateSwipe, performSwipe]);

  const handleButtonAction = useCallback((bucket: BucketType) => {
    const direction = bucket === "no" ? "left" : bucket === "yes" ? "right" : "up";
    handleSwipeComplete(direction);
  }, [handleSwipeComplete]);

  const handleUndo = useCallback(() => {
    if (!canUndo()) return;
    
    const lastAction = popUndo();
    if (lastAction) {
      removeFromBucket(lastAction.bucketAddedTo, lastAction.nameId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [canUndo, popUndo, removeFromBucket]);

  const handleViewDetails = useCallback(() => {
    if (!currentCard) return;
    navigation.navigate("NameDetail", { scoredName: currentCard });
  }, [currentCard, navigation]);

  const handleGenerateNewDeck = useCallback(() => {
    if (!canGenerateDeck()) {
      navigation.navigate("Paywall");
      return;
    }
    
    if (incrementDeckGeneration()) {
      const allBucketIds = [...buckets.yes, ...buckets.maybe, ...buckets.no];
      const familyTree = answers.familyTree as FamilyTreeData | undefined;
      // Try AI generation first, fall back to static
      generateDeckAI(answers, familyTree, allBucketIds, isPremium, 0)
        .then((result) => {
          const deck = result.names.length > 0
            ? result.names.map((name, idx) => ({ record: name, score: result.names.length - idx, reasons: name.why ? [name.why] : [] }))
            : generateDeck(answers, allBucketIds, isPremium, 0);
          setDeck(deck);
        })
        .catch(() => {
          const deck = generateDeck(answers, allBucketIds, isPremium, 0);
          setDeck(deck);
        });
    }
  }, [canGenerateDeck, incrementDeckGeneration, buckets, answers, isPremium, setDeck, navigation]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (
        Math.abs(event.velocityX) > SWIPE_VELOCITY ||
        Math.abs(event.translationX) > SWIPE_THRESHOLD
      ) {
        const direction = event.translationX > 0 ? "right" : "left";
        runOnJS(handleSwipeComplete)(direction);
      } else if (
        event.velocityY < -SWIPE_VELOCITY ||
        event.translationY < -SWIPE_THRESHOLD
      ) {
        runOnJS(handleSwipeComplete)("up");
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const yesOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const noOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const maybeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  if (isDeckEmpty) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight, paddingBottom: tabBarHeight }]}>
        <EmptyState
          image={require("../../assets/images/empty-deck.png")}
          title="All caught up!"
          subtitle="You've seen all the names in this deck. Generate a new deck to discover more."
          actionLabel="Generate New Deck"
          onAction={handleGenerateNewDeck}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
      <View style={styles.header}>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {cardsRemaining} names remaining
        </ThemedText>
      </View>

      <View style={styles.cardContainer}>
        {nextCardPreview ? (
          <View style={styles.nextCardContainer}>
            <NameCard scoredName={nextCardPreview} />
          </View>
        ) : null}
        
        {currentCard ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.currentCardContainer, cardAnimatedStyle]}>
              <NameCard scoredName={currentCard} onPress={handleViewDetails} />
              <Animated.View style={[styles.overlay, styles.yesOverlay, yesOverlayStyle]}>
                <ThemedText type="h2" style={styles.overlayText}>YES</ThemedText>
              </Animated.View>
              <Animated.View style={[styles.overlay, styles.noOverlay, noOverlayStyle]}>
                <ThemedText type="h2" style={styles.overlayText}>NOPE</ThemedText>
              </Animated.View>
              <Animated.View style={[styles.overlay, styles.maybeOverlay, maybeOverlayStyle]}>
                <ThemedText type="h2" style={styles.overlayText}>MAYBE</ThemedText>
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        ) : null}
      </View>

      <View style={[styles.actionsContainer, { paddingBottom: tabBarHeight + Spacing.xl }]}>
        <ActionButton type="undo" onPress={handleUndo} disabled={!canUndo()} size="small" />
        <ActionButton type="no" onPress={() => handleButtonAction("no")} />
        <ActionButton type="maybe" onPress={() => handleButtonAction("maybe")} />
        <ActionButton type="yes" onPress={() => handleButtonAction("yes")} />
        <ActionButton type="details" onPress={handleViewDetails} size="small" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextCardContainer: {
    position: "absolute",
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
  },
  currentCardContainer: {
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 20,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 3,
  },
  yesOverlay: {
    right: 20,
    borderColor: Colors.light.accentYes,
    backgroundColor: `${Colors.light.accentYes}20`,
  },
  noOverlay: {
    left: 20,
    borderColor: Colors.light.accentNo,
    backgroundColor: `${Colors.light.accentNo}20`,
  },
  maybeOverlay: {
    left: "50%",
    marginLeft: -50,
    borderColor: Colors.light.accentMaybe,
    backgroundColor: `${Colors.light.accentMaybe}20`,
  },
  overlayText: {
    fontWeight: "bold",
    color: Colors.light.text,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
});
