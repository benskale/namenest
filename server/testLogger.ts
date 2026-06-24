// ============================================================
// TEST LOGGER — Saves questionnaire + generated names for
// evaluation. Reads/writes a JSON file of all test runs.
// ============================================================

import fs from "fs";
import path from "path";

export interface TestNameEntry {
  name: string;
  meaning?: string;
  why?: string;
  origin?: string;
  // Rating: "good" | "bad" | "maybe" | null (unrated)
  rating?: string | null;
  notes?: string;
}

export interface TestResult {
  id: string;
  timestamp: string;
  // Which test profile was used (if any)
  profileId?: string;
  profileLabel?: string;
  // Summary of key questionnaire answers
  babySex: string;
  surname: string;
  heritage: string[];
  faith: string;
  vibes: string[];
  uniqueness: number;
  namesYouLove: string[];
  // Full answers for reference
  answers: Record<string, any>;
  // AI provider used
  model: string;
  // Generated names
  names: TestNameEntry[];
  // Quick stats
  totalNames: number;
  // Average rating across all names (computed)
  avgRating?: number;
  // Manual evaluator notes for the whole batch
  batchNotes?: string;
}

const RESULTS_DIR = path.resolve(process.cwd(), "logs");
const RESULTS_FILE = path.join(RESULTS_DIR, "name-test-results.json");

function ensureResultsFile(): void {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2));
  }
}

export function logTestResult(
  answers: Record<string, any>,
  names: { name: string; meaning?: string; why?: string; origin?: string }[],
  model: string,
  profileId?: string,
  profileLabel?: string
): TestResult {
  ensureResultsFile();

  const heritageRaw = answers.heritage;
  const heritage = Array.isArray(heritageRaw) ? heritageRaw : heritageRaw ? [String(heritageRaw)] : [];
  const vibesRaw = answers.vibes;
  const vibes = Array.isArray(vibesRaw) ? vibesRaw : [];
  const namesYouLoveRaw = answers.namesYouLove;
  const namesYouLove = Array.isArray(namesYouLoveRaw) ? namesYouLoveRaw : [];

  const entry: TestResult = {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    profileId: profileId || undefined,
    profileLabel: profileLabel || "Manual / Custom",
    babySex: String(answers.babySex || "unknown"),
    surname: String(answers.surname || ""),
    heritage,
    faith: answers.specificFaith ? String(answers.specificFaith) : answers.faithPreference === "yes" ? "general" : "none",
    vibes,
    uniqueness: typeof answers.uniqueness === "number" ? answers.uniqueness : 3,
    namesYouLove,
    answers,
    model,
    names: names.map((n) => ({
      name: n.name,
      meaning: n.meaning || undefined,
      why: n.why || undefined,
      origin: n.origin || undefined,
      rating: null,
      notes: undefined,
    })),
    totalNames: names.length,
  };

  const existing: TestResult[] = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
  existing.push(entry);
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(existing, null, 2));

  console.log(`[NameNest] Test result logged: ${entry.id} (${entry.totalNames} names)`);
  return entry;
}

export function getAllTestResults(): TestResult[] {
  ensureResultsFile();
  const data: TestResult[] = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
  // Compute avg ratings
  for (const result of data) {
    const rated = result.names.filter((n) => n.rating);
    if (rated.length > 0) {
      const scoreMap: Record<string, number> = { good: 1, maybe: 0.5, bad: 0 };
      const total = rated.reduce((sum, n) => sum + (scoreMap[n.rating!] || 0), 0);
      result.avgRating = Math.round((total / rated.length) * 100);
    }
  }
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function updateNameRating(
  resultId: string,
  nameIndex: number,
  rating: string | null,
  notes?: string
): boolean {
  ensureResultsFile();
  const data: TestResult[] = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
  const result = data.find((r) => r.id === resultId);
  if (!result || !result.names[nameIndex]) return false;

  result.names[nameIndex].rating = rating;
  if (notes !== undefined) {
    result.names[nameIndex].notes = notes;
  }

  // Recompute avg
  const rated = result.names.filter((n) => n.rating);
  if (rated.length > 0) {
    const scoreMap: Record<string, number> = { good: 1, maybe: 0.5, bad: 0 };
    const total = rated.reduce((sum, n) => sum + (scoreMap[n.rating!] || 0), 0);
    result.avgRating = Math.round((total / rated.length) * 100);
  }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
  return true;
}

export function updateBatchNotes(resultId: string, notes: string): boolean {
  ensureResultsFile();
  const data: TestResult[] = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
  const result = data.find((r) => r.id === resultId);
  if (!result) return false;
  result.batchNotes = notes;
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
  return true;
}

export function deleteTestResult(resultId: string): boolean {
  ensureResultsFile();
  const data: TestResult[] = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
  const filtered = data.filter((r) => r.id !== resultId);
  if (filtered.length === data.length) return false;
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}
