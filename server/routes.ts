import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { generateNamesWithAI } from "./aiNameGenerator";
import type { AIGenerationRequest, AIGenerationResponse } from "../client/models/types";

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

  return httpServer;
}
