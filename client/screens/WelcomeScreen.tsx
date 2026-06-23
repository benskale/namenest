import React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleStart = () => {
    navigation.replace("Questionnaire");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Image
          source={require("../../assets/images/hero-welcome.png")}
          style={styles.heroImage}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <ThemedText type="hero" style={styles.headline}>
            Find a name that fits your story
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.subheadline, { color: theme.textSecondary }]}>
            Discover meaningful baby names tailored to your family's heritage, values, and style
          </ThemedText>
        </View>
      </View>
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + Spacing["2xl"] }]}>
        <Button onPress={handleStart} style={styles.button}>
          Start Your Journey
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  heroImage: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.45,
    alignSelf: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headline: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  subheadline: {
    textAlign: "center",
  },
  bottomContainer: {
    paddingHorizontal: Spacing["2xl"],
  },
  button: {
    width: "100%",
  },
});
