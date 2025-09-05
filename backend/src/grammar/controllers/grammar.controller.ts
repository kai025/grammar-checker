import type { FastifyRequest, FastifyReply } from "fastify";
import type {
  GrammarAnalysisRequest,
  GrammarAnalysisResult,
} from "../types/grammar.types";
import { GrammarService } from "../services/GrammarService";
import { OpenAIGrammarService } from "../services/OpenAIGrammarService";

export class GrammarController {
  constructor(
    private grammarService: GrammarService,
    private openAIService?: OpenAIGrammarService
  ) {}

  async analyzeGrammar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { text, language } = request.body as GrammarAnalysisRequest;

      // Validate input
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return reply.code(400).send({
          error: "Validation Error",
          message: "Text is required and must be a non-empty string",
        });
      }

      if (text.length > 50000) {
        return reply.code(400).send({
          error: "Validation Error",
          message: "Text is too long. Maximum length is 50,000 characters",
        });
      }

      // Get user ID from JWT if available
      const userId = (request as any).user?.userId;

      // Check if user wants AI-powered analysis (from query param or header)
      const useAI =
        (request.query as any)?.ai === "true" ||
        (request.headers as any)["x-use-ai"] === "true";

      const analysisRequest: GrammarAnalysisRequest = {
        text: text.trim(),
        language: language || "en",
        userId,
      };

      let result: GrammarAnalysisResult;
      if (useAI && this.openAIService && process.env.OPENAI_API_KEY) {
        // Use OpenAI for more advanced analysis
        result = await this.openAIService.analyzeText(analysisRequest);
      } else {
        // Use LanguageTool for fast, rule-based analysis
        result = await this.grammarService.analyzeText(analysisRequest);
      }

      return reply.send(result);
    } catch (error) {
      request.log.error(`Grammar analysis error: ${(error as Error).message}`);

      if (
        error instanceof Error &&
        error.message.includes("LanguageTool API error")
      ) {
        return reply.code(503).send({
          error: "Service Unavailable",
          message: "Grammar checking service is temporarily unavailable",
        });
      }

      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to analyze grammar",
      });
    }
  }

  async getAnalysisHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;

      if (!userId) {
        return reply.code(401).send({
          error: "Unauthorized",
          message: "User authentication required",
        });
      }

      const history = await this.grammarService.getAnalysisHistory(userId);

      return reply.send(history);
    } catch (error) {
      request.log.error(
        `Failed to fetch analysis history: ${(error as Error).message}`
      );

      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch analysis history",
      });
    }
  }

  async getAnalytics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      const isAdmin = (request as any).user?.role === "ADMIN";

      // Only allow admin to see global analytics, regular users see their own
      const analyticsUserId = isAdmin ? undefined : userId;

      if (!isAdmin && !userId) {
        return reply.code(401).send({
          error: "Unauthorized",
          message: "User authentication required",
        });
      }

      const analytics = await this.grammarService.getAnalyticsData(
        analyticsUserId
      );

      return reply.send(analytics);
    } catch (error) {
      request.log.error(
        `Failed to fetch analytics: ${(error as Error).message}`
      );

      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch analytics data",
      });
    }
  }
}
