import { NameRecord } from "@/models/types";

// ============================================================
// Generates a punchy one-line selling-point summary for a name,
// distilling everything in the detail screen (meaning, vibes,
// origins, popularity, nicknames) into a teaser that makes
// the user want to tap for more.
// ============================================================

export function generateNameSummary(record: NameRecord): string {
  const sentences: string[] = [];

  // --- Sentence 1: vibes + origin + meaning ---
  const vibes = record.vibes.slice(0, 2);
  const origins = record.origins.slice(0, 2);
  const meaning = record.meaning || record.meaningKeywords.slice(0, 3).join(", ");

  if (vibes.length > 0 && origins.length > 0) {
    sentences.push(`A ${vibes.join(", ")} ${origins.join("-")} name${meaning ? ` meaning "${meaning}"` : ""}.`);
  } else if (origins.length > 0) {
    sentences.push(`A ${origins.join("-")} name${meaning ? ` meaning "${meaning}"` : ""}.`);
  } else if (vibes.length > 0) {
    sentences.push(`A ${vibes.join(", ")} name${meaning ? ` meaning "${meaning}"` : ""}.`);
  } else {
    sentences.push(`${record.name}${meaning ? ` means "${meaning}".` : "."}`);
  }

  // --- Sentence 2: popularity + nicknames teaser ---
  const extras: string[] = [];

  const tier = record.popularityTier;
  if (tier >= 4) {
    extras.push("rare and distinctive");
  } else if (tier === 3) {
    extras.push("a fresh, balanced choice");
  }

  if (record.nicknames.length > 0) {
    extras.push(`nicknames like ${record.nicknames.slice(0, 2).join(" or ")}`);
  }

  // Nickname-only or combined extras
  if (extras.length > 0) {
    // First word lowercase to continue flow
    const extraStr = extras.join(", ");
    sentences.push(capitalize(extraStr) + ".");
  }

  return sentences.join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
