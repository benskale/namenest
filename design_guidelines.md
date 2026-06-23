# NameNest Design Guidelines

## 1. Brand Identity

**Purpose**: NameNest helps expecting parents discover meaningful baby names through an intuitive, emotionally resonant swipe experience. It's a deeply personal journey—every name carries weight.

**Aesthetic Direction**: **Soft & Nurturing with Refined Touches**
- Gentle curves and breathing room evoke warmth and care
- Sophisticated typography signals trustworthiness
- Subtle premium details (soft shadows, gradients) without ostentation
- Playful swipe mechanic balanced with reverence for the decision

**Memorable Element**: The name cards themselves—beautifully typeset, floating with soft shadows, feeling like precious artifacts to be considered. Each card reveals "why it matched" in a gentle, supportive voice.

---

## 2. Navigation Architecture

**Root Navigation**: Tab Bar (3 tabs)
- **Swipe** (Deck) - Center position, core action
- **Saved** (Buckets) - Right
- **Settings** - Left

**Screen Flow**:
1. **WelcomeScreen** → (Stack-only, shown once)
2. **QuestionnaireFlowScreen** → (Stack-only, multi-step)
3. **DeckScreen** (Tab 1: Swipe)
4. **BucketsScreen** (Tab 2: Saved)
5. **SettingsScreen** (Tab 3: Settings)
6. **NameDetailScreen** (Modal from DeckScreen or BucketsScreen)
7. **PaywallScreen** (Modal, triggered by limits)

---

## 3. Screen-by-Screen Specifications

### WelcomeScreen
- **Purpose**: First impression, establish trust and warmth
- **Layout**:
  - No header
  - Scrollable content with top padding (insets.top + 60)
  - Hero illustration at top (60% screen height)
  - Headline: "Find a name that fits your story"
  - Subheadline: Brief value prop (2 lines max)
  - Primary CTA button: "Start Your Journey"
  - Bottom safe area: insets.bottom + 24
- **Components**: Hero illustration, headline text, primary button
- **Asset**: `hero-welcome.png` (soft illustration of parent + baby silhouette, warm colors)

### QuestionnaireFlowScreen
- **Purpose**: Multi-step form to build preference profile
- **Layout**:
  - Header: Progress bar (linear, 4px height), Back button (left), Skip button (right) for optional questions
  - Main content: Scrollable form with padding (24 horizontal, 32 vertical)
  - Fixed bottom bar: "Next" button (or "Finish" on last step)
  - Safe area: top = headerHeight + 16, bottom = insets.bottom + 24
- **Components**: Progress indicator, question cards (each question in a soft card with 16 radius), chips for multi-select, sliders, text inputs
- **Visual**: Each question card has subtle shadow, questions use large friendly type

### DeckScreen
- **Purpose**: Core swipe experience
- **Layout**:
  - Header: Transparent, "Swipe" title (centered), filter icon (right)
  - Main content: Swipeable card stack (vertically centered)
  - Action buttons row below stack: 5 circular buttons (No, Maybe, Yes, Undo, Details)
  - Safe area: top = headerHeight + 40, bottom = tabBarHeight + 32
- **Components**: 
  - NameCard (detailed below)
  - Circular action buttons with icons (48x48)
  - End-of-deck summary card
- **Interaction**: Cards tilt on drag, subtle haptic on swipe decision
- **Empty State**: "All caught up! Generate another deck." with illustration
- **Assets**: 
  - `empty-deck.png` (gentle illustration, used when deck complete)
  - `card-bg-texture.png` (optional subtle noise texture for cards)

### BucketsScreen
- **Purpose**: Review and manage saved names
- **Layout**:
  - Header: "Saved Names" title, share icon (right)
  - Tab selector: Yes (heart icon) / Maybe (star) / No (x) - segment control style
  - Main content: Scrollable list of name items
  - Safe area: top = headerHeight + 16, bottom = tabBarHeight + 24
- **Components**:
  - Name list items (compact cards: name + origin/vibe chips + move/delete actions)
  - Share modal (simple text list)
- **Empty States**: 
  - Yes bucket: `empty-yes.png` "No favorites yet"
  - Maybe bucket: `empty-maybe.png` "No maybes yet"
  - No bucket: `empty-no.png` "No passed names"
- **Ad Placement**: Banner ad placeholder at bottom (320x50, above tab bar)

### NameDetailScreen
- **Purpose**: Full information about a name
- **Layout**:
  - Header: Default with close button (left)
  - Scrollable content with sections:
    - Large name display (top, centered)
    - Pronunciation hint (subtle, beneath name)
    - Info grid: Meaning, Origins, Vibes (chip groups)
    - "Why it matched" callout card (soft background)
    - Variants, Nicknames (lists)
    - Middle-name pairings (horizontal scrollable chips)
  - Safe area: top = headerHeight + 24, bottom = insets.bottom + 24
- **Components**: Large type name, info chips, callout card, list items

### PaywallScreen
- **Purpose**: Convert free users to premium
- **Layout**:
  - Header: Close button (left)
  - Scrollable content:
    - Icon/illustration at top
    - Headline: "Unlock Your Perfect Name"
    - Benefits list (checkmarks + text)
    - Primary CTA: "Unlock Premium" (large button)
    - Secondary: "Restore Purchases" (text button)
  - Safe area: top = headerHeight + 32, bottom = insets.bottom + 24
- **Asset**: `paywall-illustration.png` (premium feel, golden accents)

### SettingsScreen
- **Purpose**: App preferences and data management
- **Layout**:
  - Header: "Settings" title
  - Scrollable list of settings groups:
    - Preferences (toggle for gender-neutral)
    - Data (Reset all data)
    - Account (Restore purchases stub)
    - Privacy note
  - Safe area: top = headerHeight + 16, bottom = tabBarHeight + 24
- **Components**: List items with toggles, destructive action row (red text)

---

## 4. Color Palette

**Primary**: `#E8A598` (Soft coral-pink, warm and nurturing)  
**Primary Dark**: `#D68A7B` (For pressed states)

**Background**: `#FAF9F7` (Warm off-white, not stark)  
**Surface**: `#FFFFFF` (Cards, modals)  
**Surface Elevated**: `#FFFFFF` with shadow

**Text Primary**: `#2C2C2E` (Near-black, readable)  
**Text Secondary**: `#6B6B70` (Muted gray)  
**Text Tertiary**: `#A1A1A6` (Light gray, hints)

**Accent Yes**: `#6FCF97` (Gentle green)  
**Accent Maybe**: `#F2C94C` (Warm yellow)  
**Accent No**: `#EB5757` (Soft red)

**Border**: `#E8E8EA` (Subtle dividers)  
**Overlay**: `rgba(0, 0, 0, 0.4)` (Modals, overlays)

---

## 5. Typography

**Font**: Nunito (Google Font - friendly, rounded, highly legible)

**Type Scale**:
- **Hero**: 36px, Bold (Welcome headline)
- **Title Large**: 28px, Bold (Screen titles, name on card)
- **Title**: 22px, SemiBold (Section headers)
- **Body Large**: 17px, Regular (Primary body text, name details)
- **Body**: 15px, Regular (Questions, list items)
- **Caption**: 13px, Regular (Hints, metadata, pronunciation)
- **Label**: 11px, Medium (Chips, tags, uppercase)

**Pairing**: For pronunciation hints and subtle metadata, use SF Pro Text (system font) at 13px Regular in Text Tertiary color.

---

## 6. Visual Design

### Name Card (NameCard component)
- **Dimensions**: 320w × 480h (portrait ratio)
- **Background**: White (#FFFFFF)
- **Border radius**: 20px
- **Shadow**: 
  - shadowOffset: {width: 0, height: 8}
  - shadowOpacity: 0.12
  - shadowRadius: 16
  - shadowColor: rgba(44, 44, 46, 0.15)
- **Content Layout** (top to bottom, 24px padding):
  1. Name (Title Large, centered, Text Primary)
  2. Pronunciation hint (Caption, Text Tertiary, centered, 8px below name)
  3. Spacer (16px)
  4. Chip row: Origins (2-3 chips, horizontal wrap)
  5. Chip row: Vibes (2-3 chips, horizontal wrap)
  6. Spacer (24px)
  7. "Why it matched" section:
     - Light background card (Surface with tint of Primary at 5% opacity)
     - 12px radius
     - 16px padding
     - "Why this name?" label (Label style, uppercase, Text Secondary)
     - Bullet list (Body, Text Primary, 2-3 items)

### Chips (TagChip component)
- **Dimensions**: Auto-width, 28px height
- **Background**: Primary color at 10% opacity
- **Border**: 1px Primary color at 30% opacity
- **Border radius**: 14px
- **Text**: Label style, Primary color
- **Padding**: 10px horizontal, 6px vertical

### Action Buttons (Deck)
- **Circular buttons**: 56x56
- **Background**: White
- **Border**: 2px, colors match accent (Yes green, Maybe yellow, No red)
- **Shadow**: Same as floating buttons (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- **Icons**: Feather icons, 24px, colored to match border
- **Pressed state**: Background tint of accent color at 10%

### Primary Button
- **Height**: 52px
- **Border radius**: 26px (fully rounded)
- **Background**: Linear gradient (Primary to Primary Dark, left to right)
- **Text**: Body Large, Bold, White
- **Pressed state**: Opacity 0.85, subtle scale down (0.98)

---

## 7. Assets to Generate

**Required**:
1. **icon.png** - App icon (rounded square, Primary coral with white "N" or nest symbol)
2. **splash-icon.png** - Splash screen icon (same as app icon but suitable for splash)
3. **hero-welcome.png** - Welcome screen hero (soft illustration, parent silhouette holding baby, warm palette) - USED: WelcomeScreen top
4. **empty-deck.png** - End of deck illustration (empty nest or single feather, gentle) - USED: DeckScreen empty state
5. **empty-yes.png** - Empty favorites (heart with sparkle, minimalist) - USED: BucketsScreen Yes tab
6. **empty-maybe.png** - Empty maybes (star outline, soft) - USED: BucketsScreen Maybe tab
7. **empty-no.png** - Empty passed names (subtle x or swipe away gesture) - USED: BucketsScreen No tab
8. **paywall-illustration.png** - Premium unlock visual (golden/premium feel, abstract crown or treasure) - USED: PaywallScreen

**Optional**:
9. **card-bg-texture.png** - Subtle paper/canvas texture for name cards (very light, barely visible)

**Style**: All illustrations should be minimal, soft, use the coral-pink Primary color with warm neutrals. Avoid busy details—prefer simple shapes and gentle gradients.