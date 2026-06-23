import React from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface BannerAdPlaceholderProps {
  style?: object;
}

export function BannerAdPlaceholder({ style }: BannerAdPlaceholderProps) {
  return (
    <View style={[styles.banner, style]}>
      <ThemedText type="caption" style={styles.bannerText}>
        Ad banner placeholder
      </ThemedText>
    </View>
  );
}

interface InterstitialAdPlaceholderProps {
  visible: boolean;
  onClose: () => void;
}

export function InterstitialAdPlaceholder({ visible, onClose }: InterstitialAdPlaceholderProps) {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.interstitialOverlay}>
        <View style={styles.interstitialContent}>
          <ThemedText type="h4" style={styles.interstitialTitle}>
            Interstitial Ad
          </ThemedText>
          <ThemedText type="body" style={styles.interstitialSubtitle}>
            This is a placeholder ad. Tap to close.
          </ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText type="body" style={styles.closeText}>
              Close
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

interface RewardedAdPlaceholderProps {
  onReward: () => void;
  disabled?: boolean;
}

export function RewardedAdPlaceholder({ onReward, disabled }: RewardedAdPlaceholderProps) {
  const [showAd, setShowAd] = React.useState(false);

  const handleWatch = () => {
    setShowAd(true);
  };

  const handleComplete = () => {
    setShowAd(false);
    onReward();
  };

  return (
    <>
      <Pressable
        onPress={handleWatch}
        disabled={disabled}
        style={[styles.rewardedButton, disabled && styles.rewardedButtonDisabled]}
      >
        <ThemedText type="body" style={[styles.rewardedText, disabled && styles.rewardedTextDisabled]}>
          Watch ad for +25 cards
        </ThemedText>
      </Pressable>

      <Modal visible={showAd} transparent animationType="fade">
        <View style={styles.interstitialOverlay}>
          <View style={styles.interstitialContent}>
            <ThemedText type="h4" style={styles.interstitialTitle}>
              Rewarded Ad
            </ThemedText>
            <ThemedText type="body" style={styles.interstitialSubtitle}>
              Watch this ad to unlock bonus cards
            </ThemedText>
            <Button onPress={handleComplete} style={styles.rewardButton}>
              Claim Reward
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 50,
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {
    color: Colors.light.textTertiary,
  },
  interstitialOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  interstitialContent: {
    width: "80%",
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  interstitialTitle: {
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  interstitialSubtitle: {
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  closeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
  },
  closeText: {
    color: Colors.light.primary,
  },
  rewardedButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    alignItems: "center",
  },
  rewardedButtonDisabled: {
    backgroundColor: Colors.light.backgroundTertiary,
  },
  rewardedText: {
    color: Colors.light.buttonText,
    fontWeight: "600",
  },
  rewardedTextDisabled: {
    color: Colors.light.textTertiary,
  },
  rewardButton: {
    width: "100%",
  },
});
