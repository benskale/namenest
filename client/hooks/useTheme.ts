import { Colors, GenderColors } from "@/constants/theme";
import { useAppState } from "@/hooks/useAppState";

export function useTheme() {
  const { answers } = useAppState();
  
  // Get baby sex to determine color scheme
  const babySex = (answers?.babySex as string) || "unknown";
  const genderColor = GenderColors[babySex as keyof typeof GenderColors] || GenderColors.unknown;
  
  // Always use light mode for a family-friendly experience
  // Override primary colors based on baby's gender
  const theme = {
    ...Colors.light,
    primary: genderColor.primary,
    primaryDark: genderColor.primaryDark,
    tabIconSelected: genderColor.tabIconSelected,
    link: genderColor.primary,
  };
  
  const isDark = false;

  return {
    theme,
    isDark,
    genderColor: babySex,
  };
}
