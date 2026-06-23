import {
  NameRecord,
  ScoredName,
  QuestionnaireAnswers,
  PreferenceProfile,
  Gender,
  FamilyTreeData,
  AIGenerationResponse,
  AIGenerationRequest,
} from "@/models/types";

// ============================================================
// Name Recommendation Engine
//
// Primary: Calls server-side AI endpoint for personalized names
// Fallback: Uses static names.json with local scoring
// ============================================================

export async function generateDeckAI(
  answers: QuestionnaireAnswers,
  familyTree: FamilyTreeData | undefined,
  excludeIds: string[] = [],
  isPremium: boolean = false,
  bonusCards: number = 0
): Promise<{ names: NameRecord[]; isFallback: boolean; provider: string }> {
  try {
    const response = await fetch("/api/generate-names", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        familyTree,
        excludeNames: excludeIds,
        count: isPremium ? 75 : 25 + bonusCards,
        isPremium,
      } as AIGenerationRequest),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: AIGenerationResponse = await response.json();

    if (data.names && data.names.length > 0) {
      return { names: data.names, isFallback: false, provider: data.provider };
    }

    // API responded but no names - use fallback
    throw new Error("No names returned from API");
  } catch (err) {
    console.warn("[NameNest] AI generation failed, falling back to static engine:", err);
    const fallbackNames = generateDeckStatic(answers, excludeIds, isPremium, bonusCards);
    return { names: fallbackNames.map(s => s.record), isFallback: true, provider: "static-fallback" };
  }
}

// ============================================================
// Static Fallback Engine (uses names.json)
// ============================================================

import namesData from "@/data/names.json";
import { getSimilarityScore, isVariant } from "./PhoneticMatcher";

const staticNames: NameRecord[] = namesData as NameRecord[];

export function buildPreferenceProfile(answers: QuestionnaireAnswers): PreferenceProfile {
  const heritage = (answers.heritage as string[]) || [];
  const languages = (answers.languages as string[]) || [];
  const vibes = (answers.vibes as string[]) || [];
  const meaningThemes = (answers.meaningThemes as string[]) || [];
  const uniqueness = (answers.uniqueness as number) || 3;
  const nameLength = (answers.nameLength as string) || "any";
  const babySex = (answers.babySex as string) || "unknown";
  const includeNeutral = answers.includeNeutral === "yes";
  const blocklist = (answers.blocklist as string[]) || [];
  const faithPreference = (answers.faithPreference as string) || "no";
  const honorFamily = (answers.honorFamily as string) || "no";
  const honorStyle = (answers.honorStyle as string) || "";
  const relativeNames = (answers.relativeNames as string[]) || [];

  return {
    preferredOrigins: heritage.map((h) => h.toLowerCase()),
    preferredLanguages: languages.map((l) => l.toLowerCase()),
    vibeTags: vibes.map((v) => v.toLowerCase()),
    meaningThemes: meaningThemes.map((m) => m.toLowerCase()),
    uniquenessTarget: uniqueness,
    lengthPref: nameLength,
    genderPref: babySex as Gender | "unknown",
    includeNeutral,
    avoidNames: blocklist.map((n) => n.toLowerCase().trim()),
    preferSounds: [],
    avoidSounds: [],
    faithPreference,
    honorFamilyMode: honorStyle,
    relativeNames: relativeNames.map((n) => n.toLowerCase().trim()),
  };
}

function scoreName(name: NameRecord, profile: PreferenceProfile): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (profile.avoidNames.includes(name.name.toLowerCase())) {
    return { score: -1000, reasons: ["Blocked"] };
  }

  if (profile.genderPref !== "unknown") {
    const genderMatches =
      name.gender === profile.genderPref ||
      (profile.includeNeutral && name.gender === "neutral");
    if (!genderMatches) {
      return { score: -1000, reasons: ["Wrong gender"] };
    }
  }

  if (profile.includeNeutral && name.gender === "neutral") {
    score += 2;
    reasons.push("Gender-neutral option");
  }

  const vibeMatches = name.vibes.filter((v) => profile.vibeTags.includes(v.toLowerCase()));
  if (vibeMatches.length > 0) {
    score += Math.min(vibeMatches.length * 4, 12);
    reasons.push(`Matches your vibe: ${vibeMatches.slice(0, 2).join(", ")}`);
  }

  const meaningMatches = name.meaningKeywords.filter((m) =>
    profile.meaningThemes.some((theme) => m.toLowerCase().includes(theme))
  );
  if (meaningMatches.length > 0) {
    score += Math.min(meaningMatches.length * 5, 15);
    reasons.push(`Meaning aligns with: ${meaningMatches.slice(0, 2).join(", ")}`);
  }

  const originMatches = name.origins.filter((o) =>
    profile.preferredOrigins.includes(o.toLowerCase())
  );
  if (originMatches.length > 0) {
    score += originMatches.length * 4;
    reasons.push(`Honors your ${originMatches[0]} heritage`);
  }

  const langMatches = name.languages.filter((l) =>
    profile.preferredLanguages.includes(l.toLowerCase())
  );
  if (langMatches.length > 0) {
    score += langMatches.length * 3;
  }

  if (profile.honorFamilyMode && profile.relativeNames.length > 0) {
    for (const relative of profile.relativeNames) {
      const similarity = getSimilarityScore(name.name, relative);

      if (profile.honorFamilyMode === "exact") {
        if (similarity.matchType === "exact") {
          score += 25;
          reasons.push(`Honors family member directly`);
        } else if (similarity.matchType === "variant") {
          score += 20;
          reasons.push(`Variant of family name ${relative}`);
        }
      } else if (profile.honorFamilyMode === "inspired") {
        if (similarity.matchType === "exact") {
          score += 25;
          reasons.push(`Honors family member ${relative}`);
        } else if (similarity.matchType === "variant") {
          score += 22;
          reasons.push(`Variant of family name ${relative}`);
        } else if (similarity.matchType === "phonetic" && similarity.score >= 60) {
          score += 18;
          reasons.push(`Sounds like ${relative}`);
        } else if (similarity.matchType === "phonetic" && similarity.score >= 40) {
          score += 12;
          reasons.push(`Similar sound to ${relative}`);
        } else if (similarity.matchType === "initial" && similarity.score >= 30) {
          score += 8;
          reasons.push(`Shares initial with ${relative}`);
        } else if (similarity.matchType === "partial") {
          score += 6;
          reasons.push(`Inspired by ${relative}`);
        } else if (name.variants.some((v) => isVariant(v, relative))) {
          score += 15;
          reasons.push(`Related to ${relative}`);
        }
      }
    }
  }

  const tierDiff = Math.abs(name.popularityTier - profile.uniquenessTarget);
  score += (5 - tierDiff) * 2;
  if (tierDiff === 0) {
    const uniquenessLabel = profile.uniquenessTarget <= 2 ? "popular" : profile.uniquenessTarget >= 4 ? "unique" : "balanced";
    if (!reasons.some((r) => r.includes("unique") || r.includes("popular"))) {
      reasons.push(`Matches your ${uniquenessLabel} preference`);
    }
  }

  if (profile.lengthPref !== "any") {
    const syllableMatch =
      (profile.lengthPref === "short" && name.syllables <= 2) ||
      (profile.lengthPref === "medium" && name.syllables >= 2 && name.syllables <= 3) ||
      (profile.lengthPref === "long" && name.syllables >= 3);
    if (syllableMatch) {
      score += 3;
    } else {
      score -= 2;
    }
  }

  if (profile.faithPreference === "yes" && name.religionTags.length > 0) {
    score += 5;
    reasons.push("Has spiritual significance");
  }

  if (reasons.length === 0) {
    if (name.vibes.length > 0) {
      reasons.push(`${name.vibes[0]} style name`);
    }
    if (name.origins.length > 0) {
      reasons.push(`${name.origins[0]} origin`);
    }
  }

  return { score, reasons: reasons.slice(0, 3) };
}

function diversifyDeck(scoredNames: ScoredName[], targetSize: number): ScoredName[] {
  const result: ScoredName[] = [];
  const sorted = [...scoredNames].sort((a, b) => b.score - a.score);

  let lastOrigin = "";
  let lastVibe = "";
  let originRepeat = 0;
  let vibeRepeat = 0;

  for (const name of sorted) {
    if (result.length >= targetSize) break;

    const currentOrigin = name.record.origins[0] || "";
    const currentVibe = name.record.vibes[0] || "";

    if (currentOrigin === lastOrigin) {
      originRepeat++;
      if (originRepeat > 2) continue;
    } else {
      originRepeat = 0;
    }

    if (currentVibe === lastVibe) {
      vibeRepeat++;
      if (vibeRepeat > 2) continue;
    } else {
      vibeRepeat = 0;
    }

    result.push(name);
    lastOrigin = currentOrigin;
    lastVibe = currentVibe;
  }

  while (result.length < targetSize && sorted.length > result.length) {
    const remaining = sorted.filter((n) => !result.includes(n));
    if (remaining.length === 0) break;
    result.push(remaining[0]);
  }

  return result;
}

export function generateDeckStatic(
  answers: QuestionnaireAnswers,
  excludeIds: string[] = [],
  isPremium: boolean = false,
  bonusCards: number = 0
): ScoredName[] {
  const profile = buildPreferenceProfile(answers);
  const deckSize = isPremium ? 75 : 25 + bonusCards;

  const scoredNames: ScoredName[] = staticNames
    .filter((name) => !excludeIds.includes(name.id))
    .map((name) => {
      const { score, reasons } = scoreName(name, profile);
      return { record: name, score, reasons };
    })
    .filter((sn) => sn.score > -500);

  return diversifyDeck(scoredNames, deckSize);
}

// Keep backward-compatible sync API for any existing callers
export function generateDeck(
  answers: QuestionnaireAnswers,
  excludeIds: string[] = [],
  isPremium: boolean = false,
  bonusCards: number = 0
): ScoredName[] {
  return generateDeckStatic(answers, excludeIds, isPremium, bonusCards);
}

export function getNameById(id: string): NameRecord | undefined {
  // Try static names first
  const staticName = staticNames.find((n) => n.id === id);
  if (staticName) return staticName;
  return undefined;
}

export function getMiddleNameSuggestions(name: NameRecord): NameRecord[] {
  const targetSyllables = name.syllables <= 2 ? 3 : name.syllables >= 3 ? 2 : 2;

  const candidates = staticNames
    .filter((n) => {
      if (n.id === name.id) return false;
      if (n.gender !== name.gender && n.gender !== "neutral") return false;
      const syllableDiff = Math.abs(n.syllables - targetSyllables);
      return syllableDiff <= 1;
    })
    .slice(0, 50);

  const scored = candidates.map((n) => {
    let score = 0;
    const vibeMatch = n.vibes.some((v) => name.vibes.includes(v));
    if (vibeMatch) score += 3;
    const originMatch = n.origins.some((o) => name.origins.includes(o));
    if (originMatch) score += 2;
    if (n.syllables === targetSyllables) score += 2;
    return { name: n, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((s) => s.name);
}

export function getAllNames(): NameRecord[] {
  return staticNames;
}

export function findNamesHonoringAncestor(
  ancestorName: string,
  gender?: "boy" | "girl" | "neutral",
  limit: number = 15
): Array<{ record: NameRecord; score: number; matchType: string; reason: string }> {
  const results = staticNames
    .filter((n) => !gender || n.gender === gender || n.gender === "neutral")
    .map((n) => {
      const { score, matchType } = getSimilarityScore(n.name, ancestorName);
      let reason = "";
      switch (matchType) {
        case "exact":
          reason = `Same as ${ancestorName}`;
          break;
        case "variant":
          reason = `Variant of ${ancestorName}`;
          break;
        case "phonetic":
          reason = `Sounds like ${ancestorName}`;
          break;
        case "initial":
          reason = `Shares initial with ${ancestorName}`;
          break;
        case "partial":
          reason = `Inspired by ${ancestorName}`;
          break;
        default:
          reason = "";
      }
      return { record: n, score, matchType, reason };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}
