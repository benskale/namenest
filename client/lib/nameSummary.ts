import { NameRecord } from "@/models/types";

// ============================================================
// Generates a natural, compelling 1-2 sentence blurb for a
// name card. Reads like a baby-name-site description, not a
// keyword dump. Uses varied sentence patterns so cards don't
// all sound identical.
// ============================================================

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function capList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return cap(items[0]);
  if (items.length === 2) return `${cap(items[0])} and ${cap(items[1])}`;
  return `${cap(items[0])}, ${cap(items[1])}, and ${cap(items[2])}`;
}

// Map raw vibe tags to natural adjectives
const VIBE_ADJECTIVES: Record<string, string> = {
  romantic: "warm and romantic",
  classic: "timeless",
  modern: "fresh and modern",
  vintage: "vintage charm",
  international: "internationally beloved",
  nature: "nature-inspired",
  strong: "strong and grounded",
  gentle: "soft and gentle",
  bold: "bold and striking",
  elegant: "elegant",
  playful: "playful and spirited",
  minimalist: "clean and minimalist",
  musical: "musical and lyrical",
  royal: "regal",
  spiritual: "spiritually resonant",
  mythic: "mythic",
  heroic: "heroic",
  cozy: "cozy and familiar",
  adventurous: "adventurous",
  sophisticated: "sophisticated",
};

function vibeToAdjective(vibe: string): string {
  return VIBE_ADJECTIVES[vibe.toLowerCase()] || vibe.toLowerCase();
}

function popularityPhrase(tier: number): string {
  if (tier >= 4) return "rare and distinctive";
  if (tier === 3) return "a fresh, off-the-beaten-path choice";
  if (tier === 2) return "familiar but not overused";
  return "well-loved and widely recognized";
}

export function generateNameSummary(record: NameRecord): string {
  const origins = record.origins.slice(0, 2);
  const vibes = record.vibes.slice(0, 2);
  const meaning = record.meaning || record.meaningKeywords.slice(0, 3).join(", ");
  const nicknames = record.nicknames.slice(0, 2);

  // --- Build sentence 1: the core identity ---
  const originPhrase = origins.length > 0
    ? capList(origins)
    : "";

  const vibeAdjectives = vibes.map(vibeToAdjective);
  const vibePhrase = vibeAdjectives.length > 0
    ? vibeAdjectives.join(", ")
    : "";

  let sentence1 = "";

  if (meaning && originPhrase && vibePhrase) {
    // Pattern: "A [vibe] name with [Origin] roots, meaning '[meaning].'"
    sentence1 = `A ${vibePhrase} name with ${originPhrase} roots, meaning "${meaning}."`;
  } else if (meaning && originPhrase) {
    sentence1 = `A ${originPhrase} name meaning "${meaning}."`;
  } else if (meaning && vibePhrase) {
    sentence1 = `A ${vibePhrase} name meaning "${meaning}."`;
  } else if (originPhrase && vibePhrase) {
    sentence1 = `A ${vibePhrase} name with ${originPhrase} roots.`;
  } else if (originPhrase) {
    sentence1 = `A ${originPhrase} name.`;
  } else if (meaning) {
    sentence1 = `"${cap(record.name)}" means "${meaning}."`;
  } else if (vibePhrase) {
    sentence1 = `A ${vibePhrase} name.`;
  } else {
    sentence1 = `${cap(record.name)}.`;
  }

  // --- Build sentence 2: the hook (popularity + nicknames) ---
  const extras: string[] = [];

  extras.push(popularityPhrase(record.popularityTier));

  if (nicknames.length > 0) {
    extras.push(`goes by ${nicknames.join(" or ")}`);
  }

  const sentence2 = `${cap(extras.join(", "))}.`;

  return `${sentence1} ${sentence2}`;
}

// Shorter variant for very tight card layouts (1 sentence only)
export function generateNameTagline(record: NameRecord): string {
  const meaning = record.meaning || record.meaningKeywords.slice(0, 2).join(", ");
  const origins = record.origins.slice(0, 2);
  const originPhrase = origins.length > 0 ? capList(origins) : "";

  if (meaning && originPhrase) {
    return `${originPhrase} name meaning "${meaning}"`;
  } else if (meaning) {
    return `Means "${meaning}"`;
  } else if (originPhrase) {
    return `${originPhrase} origin`;
  }
  return "";
}
