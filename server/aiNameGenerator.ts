import type { AIGenerationRequest, NameRecord, QuestionnaireAnswers, FamilyTreeData } from "../client/models/types";

// ============================================================
// AI Name Generator
//
// Sends questionnaire answers + family tree to an LLM to
// generate deeply personalized name suggestions.
//
// Supports: OpenAI, Anthropic (via OpenAI-compatible proxy),
// or any OpenAI-compatible endpoint.
//
// Env vars:
//   OPENAI_API_KEY  - API key for the LLM provider
//   OPENAI_BASE_URL - Base URL (default: Z.ai OpenAI-compatible endpoint)
//   OPENAI_MODEL    - Model name (default: glm-4.7-flash, free on Z.ai)
// ============================================================

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "glm-4.7-flash";
const DEFAULT_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.z.ai/api/openai/v1";

export function buildPrompt(req: AIGenerationRequest): { system: string; user: string } {
  const a = req.answers;
  const ft = req.familyTree;
  const count = req.count || (req.isPremium ? 75 : 25);

  // --- Extract and format answers ---
  const fmt = (key: string): string => {
    const v = a[key];
    if (v === undefined || v === null) return "";
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  const fmtArray = (key: string): string[] => {
    const v = a[key];
    if (Array.isArray(v)) return v.map(String);
    return [];
  };

  const genderMap: Record<string, string> = {
    boy: "boy",
    girl: "girl",
    unknown: "unknown / surprise",
  };

  const sections: string[] = [];

  // Core info
  sections.push(`Baby sex: ${genderMap[fmt("babySex")] || "unknown"}`);
  if (fmt("includeNeutral")) sections.push(`Include gender-neutral names: ${fmt("includeNeutral")}`);
  if (fmt("surname")) sections.push(`Last name: ${fmt("surname")}`);
  if (fmtArray("siblings").length) sections.push(`Existing children: ${fmtArray("siblings").join(", ")}`);
  if (fmt("multiples") && fmt("multiples") !== "no") sections.push(`Naming: ${fmt("multiples")}`);

  // Heritage
  if (fmtArray("continents").length) sections.push(`Family regions: ${fmtArray("continents").join(", ")}`);
  if (fmtArray("heritage").length) sections.push(`Specific cultures: ${fmtArray("heritage").join(", ")}`);
  if (fmtArray("languages").length) sections.push(`Languages at home: ${fmtArray("languages").join(", ")}`);
  if (fmt("heritageStrength")) sections.push(`Heritage connection: ${fmt("heritageStrength")}`);
  if (fmt("namingTraditions")) sections.push(`Cultural naming traditions: ${fmt("namingTraditions")}`);
  if (fmt("originStory")) sections.push(`Meaningful place: ${fmt("originStory")}`);

  // Family honoring
  if (fmt("honorFamily") && fmt("honorFamily") !== "no") {
    sections.push(`Wants to honor family: ${fmt("honorFamily")}`);
    if (fmt("honorStyle")) sections.push(`Honor style: ${fmt("honorStyle")}`);
    if (fmtArray("relativeNames").length) sections.push(`Relatives to honor: ${fmtArray("relativeNames").join(", ")}`);
    if (fmt("honorBothSides")) sections.push(`Honor both sides: ${fmt("honorBothSides")}`);
  }
  if (fmt("juniorTradition") && fmt("juniorTradition") !== "no") sections.push(`Suffix tradition: ${fmt("juniorTradition")}`);
  if (fmtArray("avoidRelatives").length) sections.push(`Family members to NOT honor: ${fmtArray("avoidRelatives").join(", ")}`);

  // Family tree
  if (ft && ft.members.length > 0) {
    const memberStrs = ft.members.map(m => `${m.name} (${m.relation}${m.side ? `, ${m.side}` : ""})`);
    sections.push(`Family tree:\n${memberStrs.map(s => "  - " + s).join("\n")}`);
  }
  if (ft && ft.ancestralSurnames.length > 0) {
    sections.push(`Ancestral surnames: ${ft.ancestralSurnames.join(", ")}`);
  }
  if (ft && ft.originNotes) {
    sections.push(`Family origin notes: ${ft.originNotes}`);
  }

  // Faith
  if (fmt("faithPreference") && fmt("faithPreference") !== "no") {
    sections.push(`Faith preference: ${fmt("faithPreference")}`);
    if (fmt("specificFaith")) sections.push(`Faith tradition: ${fmt("specificFaith")}`);
    if (fmt("religiousTexts")) sections.push(`Sacred texts: ${fmt("religiousTexts")}`);
    if (fmt("spiritualMeaning")) sections.push(`Spiritual notes: ${fmt("spiritualMeaning")}`);
  }

  // Style
  if (fmtArray("vibes").length) sections.push(`Vibes: ${fmtArray("vibes").join(", ")}`);
  if (fmt("uniqueness")) {
    const uniqLabels: Record<string, string> = { "1": "very popular", "2": "popular", "3": "balanced", "4": "uncommon", "5": "very rare" };
    sections.push(`Uniqueness: ${uniqLabels[fmt("uniqueness")] || "balanced"}`);
  }
  if (fmt("timeless")) sections.push(`Timeless vs trendy: ${fmt("timeless")}`);
  if (fmt("nameLength") && fmt("nameLength") !== "any") sections.push(`Name length: ${fmt("nameLength")}`);
  if (fmt("startingLetter")) sections.push(`Starting letter(s): ${fmt("startingLetter")}`);
  if (fmt("softVsHard") && fmt("softVsHard") !== "any") sections.push(`Sound preference: ${fmt("softVsHard")}`);
  if (fmt("syllablePref") && fmt("syllablePref") !== "any") sections.push(`Syllable preference: ${fmt("syllablePref")}`);
  if (fmt("alliteration")) sections.push(`Alliteration with surname: ${fmt("alliteration")}`);
  if (fmtArray("namesYouLove").length) sections.push(`Names they already love: ${fmtArray("namesYouLove").join(", ")}`);
  if (fmtArray("namesPartnerLoves").length) sections.push(`Names partner loves: ${fmtArray("namesPartnerLoves").join(", ")}`);

  // Meaning
  if (fmtArray("meaningThemes").length) sections.push(`Desired meanings: ${fmtArray("meaningThemes").join(", ")}`);
  if (fmtArray("natureElements").length) sections.push(`Nature elements: ${fmtArray("natureElements").join(", ")}`);
  if (fmtArray("virtues").length) sections.push(`Virtues: ${fmtArray("virtues").join(", ")}`);
  if (fmtArray("historicalFigures").length) sections.push(`Historical figures admired: ${fmtArray("historicalFigures").join(", ")}`);
  if (fmtArray("literaryMythology").length) sections.push(`Literary/mythological refs: ${fmtArray("literaryMythology").join(", ")}`);
  if (fmt("oneWordForChild")) sections.push(`One word for child: ${fmt("oneWordForChild")}`);

  // Practical
  if (fmt("pronunciation")) sections.push(`Pronunciation importance: ${fmt("pronunciation")}`);
  if (fmtArray("blocklist").length) sections.push(`Names to avoid: ${fmtArray("blocklist").join(", ")}`);
  if (fmt("initialsToAvoid")) sections.push(`Initials to avoid: ${fmt("initialsToAvoid")}`);
  if (fmt("nicknameFriendly")) sections.push(`Nickname friendly: ${fmt("nicknameFriendly")}`);
  if (fmt("internationalUse")) sections.push(`International use: ${fmt("internationalUse")}`);
  if (fmt("spelling")) sections.push(`Spelling preference: ${fmt("spelling")}`);

  // Personal
  if (fmt("familyMotto")) sections.push(`Family motto: ${fmt("familyMotto")}`);
  if (fmt("specialPlace")) sections.push(`Special place: ${fmt("specialPlace")}`);
  if (fmt("partnerAgreement")) sections.push(`Partner alignment: ${fmt("partnerAgreement")}`);
  if (fmtArray("popCulture").length) sections.push(`Pop culture refs: ${fmtArray("popCulture").join(", ")}`);
  if (fmt("anythingElse")) sections.push(`Additional notes: ${fmt("anythingElse")}`);

  const excludeStr = req.excludeNames && req.excludeNames.length > 0
    ? `\n\nDo NOT include these names (already seen): ${req.excludeNames.join(", ")}.`
    : "";

  const system = `You are NameNest, an expert baby name consultant with deep knowledge of names from every culture, language, and tradition worldwide. You understand the emotional weight of naming a child and the nuance of family heritage.

Your job: generate ${count} deeply personalized baby name suggestions based on the parent's detailed preferences and family history. Each name must feel like it was chosen by a thoughtful human expert, not a random generator.

Return a JSON array of name objects. Each object must have:
- "name": the name (string)
- "gender": "boy", "girl", or "neutral"
- "origins": array of origin strings (e.g., ["Irish", "Gaelic"])
- "languages": array of language strings
- "meaning": a rich, specific meaning (not just "strong warrior" - tell the story)
- "meaningKeywords": array of keyword strings
- "religionTags": array (empty if none)
- "vibes": array of vibe strings from: classic, modern, vintage, nature, strong, soft, whimsical, regal, mythic, minimalist, international, romantic, quirky, literary, bohemian
- "syllables": number
- "variants": array of variant/related names
- "nicknames": array of common nicknames
- "popularityTier": 1-5 (1=very popular, 5=very rare)
- "pronunciationHint": simple phonetic guide
- "why": a personalized 1-2 sentence explanation of WHY this name fits THIS family, referencing their specific answers

Be creative but grounded. Honor heritage requests faithfully. If they want to honor a family member, suggest names with genuine connections. Vary origins, lengths, and styles across the batch. Avoid duplicates and names on the blocklist.

Return ONLY the JSON array, no other text.`;

  const user = `Here is the family's naming profile:\n\n${sections.join("\n")}${excludeStr}\n\nGenerate ${count} personalized name suggestions now.`;

  return { system, user };
}

export async function generateNamesWithAI(req: AIGenerationRequest): Promise<{ names: NameRecord[]; provider: string; fallback: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { names: [], provider: "none", fallback: true };
  }

  const { system, user } = buildPrompt(req);

  try {
    const response = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.8,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[NameNest] LLM API error ${response.status}: ${errText}`);
      return { names: [], provider: DEFAULT_MODEL, fallback: true };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[NameNest] Empty LLM response");
      return { names: [], provider: DEFAULT_MODEL, fallback: true };
    }

    const names = parseLLMResponse(content);

    if (names.length === 0) {
      console.error("[NameNest] No names parsed from LLM response");
      return { names: [], provider: DEFAULT_MODEL, fallback: true };
    }

    return { names, provider: DEFAULT_MODEL, fallback: false };

  } catch (err) {
    console.error("[NameNest] AI generation failed:", err);
    return { names: [], provider: DEFAULT_MODEL, fallback: true };
  }
}

function parseLLMResponse(content: string): NameRecord[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to extract JSON array from the text
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        console.error("[NameNest] Could not parse JSON from LLM response");
        return [];
      }
    } else {
      console.error("[NameNest] No JSON found in LLM response");
      return [];
    }
  }

  // Handle both { names: [...] } and [...] formats
  let rawNames: unknown[];
  if (Array.isArray(parsed)) {
    rawNames = parsed;
  } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>).names)) {
    rawNames = (parsed as Record<string, unknown>).names as unknown[];
  } else {
    console.error("[NameNest] Unexpected LLM response format");
    return [];
  }

  return rawNames
    .filter((n): n is Record<string, unknown> => n !== null && typeof n === "object")
    .map((raw, idx) => normalizeName(raw, idx))
    .filter((n): n is NameRecord => n !== null);
}

function normalizeName(raw: Record<string, unknown>, idx: number): NameRecord | null {
  const name = String(raw.name || "").trim();
  if (!name) return null;

  return {
    id: `ai-${idx}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    name,
    gender: normalizeGender(raw.gender),
    origins: toStringArray(raw.origins),
    languages: toStringArray(raw.languages),
    meaningKeywords: toStringArray(raw.meaningKeywords),
    religionTags: toStringArray(raw.religionTags),
    vibes: toStringArray(raw.vibes),
    syllables: typeof raw.syllables === "number" ? raw.syllables : estimateSyllables(name),
    variants: toStringArray(raw.variants),
    nicknames: toStringArray(raw.nicknames),
    popularityTier: typeof raw.popularityTier === "number" ? Math.min(5, Math.max(1, raw.popularityTier)) : 3,
    pronunciationHint: String(raw.pronunciationHint || ""),
    meaning: String(raw.meaning || ""),
    why: String(raw.why || ""),
  };
}

function normalizeGender(g: unknown): "boy" | "girl" | "neutral" {
  const s = String(g || "").toLowerCase();
  if (s === "boy" || s === "male") return "boy";
  if (s === "girl" || s === "female") return "girl";
  return "neutral";
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") return [v];
  return [];
}

function estimateSyllables(name: string): number {
  const lower = name.toLowerCase();
  const vowels = lower.match(/[aeiouy]+/g);
  return Math.max(1, vowels ? vowels.length : 1);
}
