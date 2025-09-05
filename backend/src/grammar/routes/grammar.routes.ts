import type { FastifyInstance } from "fastify";
import { GrammarController } from "../controllers/grammar.controller";
import { GrammarService } from "../services/GrammarService";

export default async function grammarRoutes(fastify: FastifyInstance) {
  const grammarService = new GrammarService(fastify.prisma);
  const grammarController = new GrammarController(grammarService);

  // Swagger schemas
  const analyzeGrammarSchema = {
    tags: ["Grammar"],
    summary: "Analyze text for grammar errors",
    description:
      "Analyzes the provided text for grammar, spelling, and style errors",
    body: {
      type: "object",
      required: ["text"],
      properties: {
        text: {
          type: "string",
          description: "Text to analyze for grammar errors",
          maxLength: 50000,
          minLength: 1,
        },
        language: {
          type: "string",
          description: 'Language code (e.g., "en", "es", "fr")',
          default: "en",
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                message: { type: "string" },
                shortMessage: { type: "string" },
                offset: { type: "number" },
                length: { type: "number" },
                replacements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      value: { type: "string" },
                      shortDescription: { type: "string" },
                    },
                  },
                },
                rule: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    description: { type: "string" },
                    category: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                    issueType: { type: "string" },
                  },
                },
                sentence: { type: "string" },
                type: {
                  type: "object",
                  properties: {
                    typeName: { type: "string" },
                  },
                },
              },
            },
          },
          totalErrors: { type: "number" },
          language: { type: "string" },
          processingTime: { type: "number" },
          textLength: { type: "number" },
        },
      },
    },
  };

  const historySchema = {
    tags: ["Grammar"],
    summary: "Get user's grammar analysis history",
    description: "Retrieves the authenticated user's previous grammar analyses",
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            text: { type: "string" },
            language: { type: "string" },
            totalErrors: { type: "number" },
            processingTime: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            errors: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
      },
    },
  };

  const analyticsSchema = {
    tags: ["Grammar"],
    summary: "Get grammar analysis analytics",
    description:
      "Retrieves analytics data for the authenticated user or global data for admins",
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: "object",
        properties: {
          totalAnalyses: { type: "number" },
          averageErrors: { type: "number" },
          averageProcessingTime: { type: "number" },
          mostCommonErrors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                count: { type: "number" },
              },
            },
          },
        },
      },
    },
  };

  // Public route for grammar analysis (with optional authentication)
  fastify.post(
    "/analyze",
    {
      schema: analyzeGrammarSchema,
      preHandler: async (request, _reply) => {
        // Optional auth: verify token only if present, never fail the request here
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          try {
            await (request as any).jwtVerify();
          } catch {
            request.log.info("Invalid token provided, proceeding as anonymous");
          }
        } else {
          request.log.info("Anonymous grammar analysis request");
        }
      },
    },
    grammarController.analyzeGrammar.bind(grammarController)
  );

  // Protected routes (require authentication)
  fastify.get(
    "/history",
    {
      schema: historySchema,
      preHandler: [fastify.authenticate],
    },
    grammarController.getAnalysisHistory.bind(grammarController)
  );

  fastify.get(
    "/analytics",
    {
      schema: analyticsSchema,
      preHandler: [fastify.authenticate],
    },
    grammarController.getAnalytics.bind(grammarController)
  );
}
