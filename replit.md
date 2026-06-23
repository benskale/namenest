# NameNest

## Overview

NameNest is a React Native/Expo mobile application that helps expecting parents discover meaningful baby names through a questionnaire-based recommendation engine and Tinder-style swipe interface. Users complete a preferences questionnaire, receive a personalized deck of name recommendations with explanations for each match, and swipe to sort names into Yes/Maybe/No buckets.

The app follows a local-first, freemium model with daily limits for free users and premium features available via in-app purchase. It runs on iOS, Android, and web platforms through Expo.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54, targeting iOS, Android, and web
- **Navigation**: React Navigation with native stack navigators and bottom tab navigation
- **State Management**: React Context (AppStateProvider) with AsyncStorage for persistence
- **Animations**: React Native Reanimated for swipe gestures and UI animations
- **Data Fetching**: TanStack React Query for server state management
- **Styling**: StyleSheet with a comprehensive theme system (Colors, Spacing, Typography, Shadows)

### Backend Architecture
- **Runtime**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Build**: esbuild for server bundling, tsx for development

### Key Design Patterns
- **Recommendation Engine**: Client-side scoring algorithm that builds preference profiles from questionnaire answers and scores names against multiple criteria (origins, vibes, meanings, uniqueness, ancestor honoring)
- **Phonetic Matching**: PhoneticMatcher service using double metaphone algorithm and Levenshtein distance for ancestor name honoring with match types (exact, variant, phonetic, initial, partial)
- **Name Database**: 1000 curated names across 80+ cultures with metadata including origins, languages, meanings, vibes, popularity tiers, and pronunciation hints
- **Swipe Deck**: Custom gesture-based card stack using React Native Gesture Handler with physics-based animations
- **Bucket System**: Three-way sorting (Yes/Maybe/No) with undo support and cross-bucket movement
- **Freemium Gating**: Daily limits on deck generations and undo actions, with ad placeholders and paywall screen

### Navigation Structure
```
RootStackNavigator
├── WelcomeScreen (onboarding)
├── QuestionnaireScreen (preferences)
├── MainTabNavigator
│   ├── SettingsTab → SettingsStackNavigator
│   ├── DeckTab → DeckStackNavigator (center, primary)
│   └── BucketsTab → BucketsStackNavigator
├── NameDetailScreen (modal)
└── PaywallScreen (modal)
```

### Data Flow
1. User completes questionnaire → answers stored in AppState
2. RecommendationEngine builds PreferenceProfile from answers
3. Engine scores all names and generates ranked deck with match reasons
4. User swipes through deck, names sorted into buckets
5. All state persisted to AsyncStorage with automatic sync

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema-first approach with migrations in `/migrations` directory

### Third-Party Services
- **Expo Services**: Splash screen, haptics, blur effects, fonts (Nunito via Google Fonts)
- **Ad Placeholders**: Stub implementations for banner and interstitial ads (no real ad SDK integrated)
- **In-App Purchases**: Placeholder premium service (no real IAP SDK integrated)

### Key npm Dependencies
- `expo` (SDK 54) - Core mobile framework
- `react-navigation/*` - Navigation stack
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Swipe gestures
- `@tanstack/react-query` - Server state
- `drizzle-orm` / `drizzle-zod` - Database ORM
- `express` - Backend server
- `pg` - PostgreSQL client

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN` - API server domain for client requests
- `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS` - Replit-specific CORS configuration