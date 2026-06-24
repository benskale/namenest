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
const DEFAULT_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.z.ai/api/paas/v4";

// Retry config for Z.ai free-tier rate limiting (429s are common)
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 2000; // start at 2s
const REQUEST_TIMEOUT_MS = 45000; // 45s per attempt (batch generation needs more time)

// Batch size — smaller batches = more thought per name = higher quality
const BATCH_SIZE = 10;

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

  // Merge excludeNames (passed-in) with any from the request
  const allExcludes = [...(req.excludeNames || [])];
  const excludeStr = allExcludes.length > 0
    ? `\n\nDo NOT include these names (already shown): ${allExcludes.join(", ")}. Each name must be completely different from these.`
    : "";

  const system = `You are NameNest, an elite baby name consultant trusted by discerning parents worldwide. You have encyclopedic knowledge of names from every culture, language, and tradition, including their etymology, historical usage, literary associations, and cultural nuance.

You are generating ${count} name suggestions for a specific family. Quality over quantity. Every single name should feel handpicked by a human expert who deeply understood this family's story.

## CRITICAL QUALITY RULES

1. AVOID GENERIC NAMES. Do not default to the top 50 baby names (no Olivia, Emma, Liam, Noah, Ava, etc.) unless the parents explicitly asked for popular names. Dig deeper. Find names with real character.
2. RESPECT HERITAGE. If they specified cultures or regions, at least 40% of names should have genuine roots in those cultures. Research real names from those traditions.
3. HONOR FAMILY THOUGHTFULLY. If they want to honor a relative, don't just suggest the exact name - find names that share roots, meanings, sounds, or first letters.
4. DIVERSIFY. No two names should share the same origin, starting letter, or ending sound. Spread across origins, lengths, and popularity tiers.
5. MATCH THE VIBE. If they asked for unique/rare names, don't give them common ones. If they asked for classic, don't give trendy. Read their preferences carefully.
6. REAL MEANINGS. Provide accurate, specific etymological meanings. Not just "strong" or "beautiful" - give the actual linguistic root and what it meant to the people who first used it.
7. PERSONALIZE THE WHY. The "why" field must reference THIS family's specific answers. Not "this is a strong name" but "this echoes your love of Irish heritage and your grandmother's name Bridget."

## OUTPUT FORMAT

Return a JSON object with a "names" array. Each object:
{
  "name": "the name",
  "gender": "boy" | "girl" | "neutral",
  "origins": ["Irish", "Gaelic"],
  "languages": ["Irish", "English"],
  "meaning": "Rich, specific meaning with linguistic root and story",
  "meaningKeywords": ["keyword1", "keyword2"],
  "religionTags": [],
  "vibes": ["classic", "strong"],
  "syllables": 2,
  "variants": ["related", "names"],
  "nicknames": ["nick", "names"],
  "popularityTier": 1-5,
  "pronunciationHint": "phonetic guide",
  "why": "1-2 sentences referencing THIS family's specific answers"
}

## EXAMPLE (this is the quality bar):

For a family wanting Irish heritage, nature themes, and uncommon names:
{
  "name": "Saoirse",
  "gender": "girl",
  "origins": ["Irish"],
  "languages": ["Irish", "English"],
  "meaning": "From the Irish word for 'freedom' or 'liberty' - became popular as a name during Ireland's independence movement, symbolizing the spirit of a free nation",
  "meaningKeywords": ["freedom", "independence", "liberty", "Irish"],
  "religionTags": [],
  "vibes": ["classic", "strong", "international"],
  "syllables": 2,
  "variants": ["Searsy", "Saoirsa"],
  "nicknames": ["Sasha", "Sair"],
  "popularityTier": 4,
  "pronunciationHint": "SEER-sha",
  "why": "A deeply Irish name that embodies your connection to Irish heritage, with a meaning (freedom) that resonates with the natural, untamed spirit you want for your daughter."
}

Return ONLY a JSON object: { "names": [...] }. No other text.`;

  const user = `Here is the family's naming profile:\n\n${sections.join("\n")}${excludeStr}\n\nGenerate ${count} exceptional, deeply personalized name suggestions. Every name should feel like it was chosen specifically for THIS family.`;

  return { system, user };
}

export async function generateNamesWithAI(req: AIGenerationRequest): Promise<{ names: NameRecord[]; provider: string; fallback: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { names: [], provider: "none", fallback: true };
  }

  const totalCount = req.count || (req.isPremium ? 75 : 25);
  const batches: number[] = [];
  for (let i = 0; i < totalCount; i += BATCH_SIZE) {
    batches.push(Math.min(BATCH_SIZE, totalCount - i));
  }

  console.log(`[NameNest] Generating ${totalCount} names in ${batches.length} batch(es) of ~${BATCH_SIZE}`);

  const allNames: NameRecord[] = [];
  const seenNames = new Set<string>(req.excludeNames?.map(n => n.toLowerCase()) || []);

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batchCount = batches[batchIdx];
    const batchReq: AIGenerationRequest = {
      ...req,
      count: batchCount,
      excludeNames: Array.from(seenNames),
    };

    console.log(`[NameNest] Batch ${batchIdx + 1}/${batches.length}: requesting ${batchCount} names (excluding ${seenNames.size} already generated)`);

    const batchNames = await callLLM(batchReq);

    if (batchNames.length === 0) {
      console.warn(`[NameNest] Batch ${batchIdx + 1} returned 0 names`);
      if (batchIdx === 0) {
        // First batch failed entirely — return fallback
        return { names: [], provider: DEFAULT_MODEL, fallback: true };
      }
      // Subsequent batch failed — return what we have so far
      break;
    }

    // Deduplicate within and across batches
    for (const name of batchNames) {
      const lower = name.name.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        allNames.push(name);
      }
    }

    console.log(`[NameNest] Batch ${batchIdx + 1} complete: ${batchNames.length} received, ${allNames.length} total unique names`);
  }

  if (allNames.length === 0) {
    return { names: [], provider: DEFAULT_MODEL, fallback: true };
  }

  return { names: allNames, provider: DEFAULT_MODEL, fallback: false };
}

/**
 * Makes a single LLM API call with retry logic for rate limiting.
 */
async function callLLM(req: AIGenerationRequest): Promise<NameRecord[]> {
  const { system, user } = buildPrompt(req);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.75,
          max_tokens: 6000,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      // Retry on 429 (rate limit) or 5xx (server error)
      if (response.status === 429 || response.status >= 500) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(`[NameNest] LLM API ${response.status} on attempt ${attempt + 1}/${MAX_RETRIES + 1}, retrying in ${backoff}ms...`);
        if (attempt < MAX_RETRIES) {
          await sleep(backoff);
          continue;
        }
        console.error(`[NameNest] LLM API rate-limited after ${MAX_RETRIES + 1} attempts, giving up`);
        return [];
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[NameNest] LLM API error ${response.status}: ${errText}`);
        return [];
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error("[NameNest] Empty LLM response");
        return [];
      }

      const names = parseLLMResponse(content);

      if (names.length === 0) {
        console.error("[NameNest] No names parsed from LLM response");
        return [];
      }

      if (attempt > 0) {
        console.log(`[NameNest] LLM call succeeded on attempt ${attempt + 1}`);
      }

      return names;

    } catch (err) {
      // Network errors, timeouts — retry with backoff
      if (attempt < MAX_RETRIES) {
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(`[NameNest] Request failed on attempt ${attempt + 1}/${MAX_RETRIES + 1}, retrying in ${backoff}ms...`, err instanceof Error ? err.message : err);
        await sleep(backoff);
        continue;
      }
      console.error("[NameNest] AI generation failed after all retries:", err);
      return [];
    }
  }

  return [];
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
