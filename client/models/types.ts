export type Gender = "boy" | "girl" | "neutral";

export interface NameRecord {
  id: string;
  name: string;
  gender: Gender;
  origins: string[];
  languages: string[];
  meaningKeywords: string[];
  religionTags: string[];
  vibes: string[];
  syllables: number;
  variants: string[];
  nicknames: string[];
  popularityTier: number;
  pronunciationHint: string;
  meaning?: string;
  why?: string;
}

export interface ScoredName {
  record: NameRecord;
  score: number;
  reasons: string[];
}

export type BucketType = "yes" | "maybe" | "no";

export interface Buckets {
  yes: string[];
  maybe: string[];
  no: string[];
}

export interface UndoAction {
  nameId: string;
  previousDeckIndex: number;
  bucketAddedTo: BucketType;
  timestamp: number;
}

export type QuestionType =
  | "singleSelect"
  | "multiSelect"
  | "slider"
  | "text"
  | "textarea"
  | "toggle"
  | "textList"
  | "dynamicMultiSelect"
  | "familyTree"
  | "gradient";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
  side?: "maternal" | "paternal";
}

export interface FamilyTreeData {
  members: FamilyMember[];
  ancestralSurnames: string[];
  originNotes: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  subtitle?: string;
  type: QuestionType;
  options?: QuestionOption[];
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  optional?: boolean;
  placeholder?: string;
  maxLength?: number;
  dependsOn?: {
    questionId: string;
    value?: string | string[];
    hasAnyValue?: boolean;
  };
  /** Marks this as the start of an opt-in deep section */
  sectionIntro?: boolean;
  /** Short label for progress bar grouping */
  sectionLabel?: string;
}

export interface QuestionnaireAnswers {
  [questionId: string]: string | string[] | number | boolean | FamilyTreeData;
}

export interface PreferenceProfile {
  preferredOrigins: string[];
  preferredLanguages: string[];
  meaningThemes: string[];
  vibeTags: string[];
  uniquenessTarget: number;
  lengthPref: string;
  syllablePref?: number;
  genderPref: Gender | "unknown";
  includeNeutral: boolean;
  avoidNames: string[];
  preferSounds: string[];
  avoidSounds: string[];
  faithPreference: string;
  honorFamilyMode: string;
  relativeNames: string[];
}

export interface DailyLimits {
  date: string;
  deckGenerations: number;
  undoCount: number;
  rewardedAdUsed: boolean;
}

export interface AppState {
  hasCompletedOnboarding: boolean;
  answers: QuestionnaireAnswers;
  buckets: Buckets;
  currentDeck: ScoredName[];
  currentDeckIndex: number;
  undoStack: UndoAction[];
  isPremium: boolean;
  dailyLimits: DailyLimits;
  includeNeutralInSettings: boolean;
}

export interface AIGenerationRequest {
  answers: QuestionnaireAnswers;
  familyTree?: FamilyTreeData;
  excludeNames?: string[];
  count?: number;
  isPremium?: boolean;
}

export interface AIGenerationResponse {
  names: NameRecord[];
  provider: string;
  fallback: boolean;
}
