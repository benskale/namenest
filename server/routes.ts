import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { generateNamesWithAI } from "./aiNameGenerator";
import type { AIGenerationRequest, AIGenerationResponse } from "../client/models/types";
import {
  logTestResult,
  getAllTestResults,
  updateNameRating,
  updateBatchNotes,
  deleteTestResult,
} from "./testLogger";
import { generateDashboardHTML } from "./dashboardHTML";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // ============================================================
  // POST /api/generate-names
  // Generates personalized name suggestions via AI.
  // Falls back to static names.json if no OPENAI_API_KEY is set.
  // ============================================================
  app.post("/api/generate-names", async (req, res) => {
    try {
      const { answers, familyTree, excludeNames, count, isPremium } = req.body as AIGenerationRequest;

      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Missing questionnaire answers" });
      }

      const aiRequest: AIGenerationRequest = {
        answers,
        familyTree,
        excludeNames: excludeNames || [],
        count: count || (isPremium ? 75 : 25),
        isPremium: isPremium || false,
      };

      const result = await generateNamesWithAI(aiRequest);

      // ---- Log test results for evaluation (dev feature) ----
      if (result.names.length > 0) {
        const { _testProfileId, _testProfileLabel, ...cleanAnswers } = answers as any;
        try {
          logTestResult(
            cleanAnswers,
            result.names,
            result.provider || process.env.OPENAI_MODEL || "unknown",
            _testProfileId,
            _testProfileLabel,
          );
          console.log(`[NameNest] Test result auto-logged for evaluation`);
        } catch (logErr) {
          console.warn("[NameNest] Failed to log test result:", logErr);
        }
      }

      if (result.fallback || result.names.length === 0) {
        // Fallback to static names
        return res.json({
          names: [],
          provider: "fallback-static",
          fallback: true,
          message: "AI name generation unavailable. Set OPENAI_API_KEY to enable personalized generation.",
        } satisfies AIGenerationResponse);
      }

      return res.json({
        names: result.names,
        provider: result.provider,
        fallback: false,
      } satisfies AIGenerationResponse);

    } catch (err) {
      console.error("[NameNest] /api/generate-names error:", err);
      return res.status(500).json({ error: "Name generation failed" });
    }
  });

  // ============================================================
  // GET /api/health
  // Health check endpoint
  // ============================================================
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      aiEnabled: !!process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "glm-4.7-flash",
    });
  });

  // ============================================================
  // === TEST EVALUATION ENDPOINTS (dev feature) ===
  // ============================================================

  // GET /api/test-results — List all saved test runs (JSON)
  app.get("/api/test-results", (_req, res) => {
    res.json(getAllTestResults());
  });

  // POST /api/test-results/:id/rate — Rate a single name
  app.post("/api/test-results/:id/rate", (req, res) => {
    const { id } = req.params;
    const { nameIndex, rating, notes } = req.body;
    const ok = updateNameRating(id, nameIndex, rating, notes);
    if (!ok) return res.status(404).json({ error: "Result or name not found" });
    res.json({ ok: true });
  });

  // POST /api/test-results/:id/notes — Update batch notes
  app.post("/api/test-results/:id/notes", (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    const ok = updateBatchNotes(id, notes);
    if (!ok) return res.status(404).json({ error: "Result not found" });
    res.json({ ok: true });
  });

  // DELETE /api/test-results/:id — Delete a test run
  app.delete("/api/test-results/:id", (req, res) => {
    const { id } = req.params;
    const ok = deleteTestResult(id);
    if (!ok) return res.status(404).json({ error: "Result not found" });
    res.json({ ok: true });
  });

  // GET /test-results — Evaluation dashboard (HTML)
  app.get("/test-results", (_req, res) => {
    const results = getAllTestResults();
    res.setHeader("Content-Type", "text/html");
    res.send(generateDashboardHTML(results));
  });

  return httpServer;
}
