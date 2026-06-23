import { Platform } from "react-native";

// Gender-based primary colors
export const GenderColors = {
  girl: {
    primary: "#F5A3B5",
    primaryDark: "#E08A9C",
    tabIconSelected: "#F5A3B5",
  },
  boy: {
    primary: "#7EB5D6",
    primaryDark: "#5A9BC4",
    tabIconSelected: "#7EB5D6",
  },
  unknown: {
    primary: "#E8A598",
    primaryDark: "#D68A7B",
    tabIconSelected: "#E8A598",
  },
};

export const Colors = {
  light: {
    text: "#2C2C2E",
    textSecondary: "#6B6B70",
    textTertiary: "#A1A1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B6B70",
    tabIconSelected: "#E8A598",
    link: "#E8A598",
    primary: "#E8A598",
    primaryDark: "#D68A7B",
    accentYes: "#6FCF97",
    accentMaybe: "#F2C94C",
    accentNo: "#EB5757",
    backgroundRoot: "#FAF9F7",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#FFFFFF",
    backgroundTertiary: "#F5F5F3",
    surface: "#FFFFFF",
    border: "#E8E8EA",
    overlay: "rgba(0, 0, 0, 0.4)",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    textTertiary: "#6B6B70",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#E8A598",
    link: "#E8A598",
    primary: "#E8A598",
    primaryDark: "#D68A7B",
    accentYes: "#6FCF97",
    accentMaybe: "#F2C94C",
    accentNo: "#EB5757",
    backgroundRoot: "#1C1C1E",
    backgroundDefault: "#2C2C2E",
    backgroundSecondary: "#3A3A3C",
    backgroundTertiary: "#48484A",
    surface: "#2C2C2E",
    border: "#48484A",
    overlay: "rgba(0, 0, 0, 0.6)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  "2xl": 26,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 36,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  titleLarge: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Nunito_700Bold",
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
    fontFamily: "Nunito_600SemiBold",
  },
  bodyLarge: {
    fontSize: 17,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  label: {
    fontSize: 11,
    fontWeight: "500" as const,
    fontFamily: "Nunito_500Medium",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
    fontFamily: "Nunito_400Regular",
  },
};

export const Shadows = {
  card: {
    shadowColor: "rgba(44, 44, 46, 0.15)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    shadowColor: "rgba(44, 44, 46, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  subtle: {
    shadowColor: "rgba(44, 44, 46, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
