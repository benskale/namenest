import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Colors, Shadows, BorderRadius } from "@/constants/theme";

type ActionType = "yes" | "no" | "maybe" | "undo" | "details";

interface ActionButtonProps {
  type: ActionType;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  size?: "small" | "large";
}

const getIconName = (type: ActionType): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "yes":
      return "heart";
    case "no":
      return "x";
    case "maybe":
      return "star";
    case "undo":
      return "rotate-ccw";
    case "details":
      return "info";
  }
};

const getColor = (type: ActionType): string => {
  switch (type) {
    case "yes":
      return Colors.light.accentYes;
    case "no":
      return Colors.light.accentNo;
    case "maybe":
      return Colors.light.accentMaybe;
    case "undo":
    case "details":
      return Colors.light.textSecondary;
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionButton({
  type,
  onPress,
  disabled = false,
  style,
  size = "large",
}: ActionButtonProps) {
  const scale = useSharedValue(1);
  const color = getColor(type);
  const iconName = getIconName(type);
  const buttonSize = size === "large" ? 56 : 44;
  const iconSize = size === "large" ? 24 : 20;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          borderColor: color,
          opacity: disabled ? 0.4 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Feather name={iconName} size={iconSize} color={color} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.button,
  },
});
