import type { PrismaClient } from "@prisma/client";
import type {
  GrammarAnalysisRequest,
  GrammarAnalysisResult,
  GrammarAnalysisRecord,
  LanguageToolResponse,
  GrammarError,
} from "../types/grammar.types";

export class GrammarService {
  constructor(private prisma: PrismaClient) {}

  async analyzeText(
    request: GrammarAnalysisRequest
  ): Promise<GrammarAnalysisResult> {
    const startTime = Date.now();

    try {
      // Call LanguageTool API
      const languageToolResult = await this.callLanguageTool(
        request.text,
        request.language || "en"
      );

      const processingTime = Date.now() - startTime;

      // Transform LanguageTool response to our format
      const errors: GrammarError[] = languageToolResult.matches.map(
        (match) => ({
          message: match.message,
          shortMessage: match.shortMessage,
          offset: match.offset,
          length: match.length,
          replacements: match.replacements,
          rule: {
            id: match.rule.id,
            description: match.rule.description,
            category: {
              id: match.rule.category.id,
              name: match.rule.category.name,
            },
            issueType: match.rule.issueType,
          },
          sentence: match.sentence,
          type: match.type,
        })
      );

      const result: GrammarAnalysisResult = {
        errors,
        totalErrors: errors.length,
        language: languageToolResult.language.code,
        processingTime,
        textLength: request.text.length,
      };

      // Store analysis in database for analytics
      await this.storeAnalysis({
        userId: request.userId,
        text: request.text,
        language: request.language || "en",
        totalErrors: result.totalErrors,
        processingTime,
        errors,
      });

      return result;
    } catch (error) {
      console.error("Grammar analysis error:", error);
      throw new Error("Failed to analyze grammar");
    }
  }

  private async callLanguageTool(
    text: string,
    language: string
  ): Promise<LanguageToolResponse> {
    const LANGUAGETOOL_API_URL =
      process.env.LANGUAGETOOL_API_URL ||
      "https://api.languagetool.org/v2/check";

    const normalizeLanguage = (
      lang: string
    ): {
      code: string;
      preferredVariant?: string;
      motherTongue?: string;
    } => {
      const base = lang.toLowerCase();
      // Map common short codes to specific variants accepted by LT
      const mapped: Record<string, string> = {
        en: "en-US",
        de: "de-DE",
        fr: "fr-FR",
        it: "it-IT",
        nl: "nl",
        es: "es",
        pt: "pt-PT",
        pl: "pl-PL",
        ru: "ru-RU",
        "zh-cn": "zh-CN",
      };
      const variant = mapped[base] || lang;
      const hasVariant = /.+-.+/.test(variant);
      const motherTongue = variant.split("-")[0];
      return {
        code: variant,
        preferredVariant: hasVariant ? variant : undefined,
        motherTongue: motherTongue.length === 2 ? motherTongue : undefined,
      };
    };

    const { code, preferredVariant, motherTongue } =
      normalizeLanguage(language);

    const buildBody = (opts?: { omitHints?: boolean }) => {
      const fd = new URLSearchParams();
      fd.append("text", text);
      fd.append("language", code);
      
      // Enhanced grammar checking options
      fd.append("enabledOnly", "false"); // Check all rules, not just enabled ones
      fd.append("level", "picky"); // More thorough checking (picky > default)
      fd.append("enabledCategories", "GRAMMAR,TYPOS,STYLE,PUNCTUATION,CASING,REDUNDANCY,SEMANTICS,MISC");
      
      if (!opts?.omitHints) {
        if (preferredVariant) fd.append("preferredVariants", preferredVariant);
        if (motherTongue) fd.append("motherTongue", motherTongue);
        
        // Additional quality improvements
        fd.append("allowIncompleteResults", "false"); // Wait for complete analysis
        fd.append("enableTempOffRules", "true"); // Include temporarily disabled rules
      }
      return fd.toString();
    };

    try {
      // First attempt with hints
      let response = await fetch(LANGUAGETOOL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "Grammar-Checker/1.0.0",
        },
        body: buildBody(),
      });

      // If LT rejects parameters (400), retry without hints
      if (!response.ok && response.status === 400) {
        response = await fetch(LANGUAGETOOL_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent": "Grammar-Checker/1.0.0",
          },
          body: buildBody({ omitHints: true }),
        });
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(
          `LanguageTool API error: ${response.status} ${response.statusText}${
            errText ? ` - ${errText}` : ""
          }`
        );
      }

      return (await response.json()) as LanguageToolResponse;
    } catch (error) {
      console.error("LanguageTool API call failed:", error);
      throw new Error(
        `Failed to call LanguageTool API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async storeAnalysis(
    data: Omit<GrammarAnalysisRecord, "id" | "createdAt">
  ): Promise<void> {
    try {
      await this.prisma.grammarAnalysis.create({
        data: {
          userId: data.userId,
          text: data.text,
          language: data.language,
          totalErrors: data.totalErrors,
          processingTime: data.processingTime,
          errors: JSON.stringify(data.errors),
        },
      });
    } catch (error) {
      // Log error but don't fail the request if we can't store analytics
      console.error("Failed to store grammar analysis:", error);
    }
  }

  async getAnalysisHistory(
    userId: string,
    limit = 50
  ): Promise<GrammarAnalysisRecord[]> {
    try {
      const records = await this.prisma.grammarAnalysis.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return records.map((record: any) => ({
        id: record.id,
        userId: record.userId || undefined,
        text: record.text,
        language: record.language,
        totalErrors: record.totalErrors,
        processingTime: record.processingTime,
        createdAt: record.createdAt,
        errors: JSON.parse(record.errors as string) as GrammarError[],
      }));
    } catch (error) {
      console.error("Failed to fetch analysis history:", error);
      throw new Error("Failed to fetch analysis history");
    }
  }

  async getAnalyticsData(userId?: string): Promise<{
    totalAnalyses: number;
    averageErrors: number;
    averageProcessingTime: number;
    mostCommonErrors: Array<{ category: string; count: number }>;
  }> {
    try {
      const whereClause = userId ? { userId } : {};

      const analyses = await this.prisma.grammarAnalysis.findMany({
        where: whereClause,
        select: {
          totalErrors: true,
          processingTime: true,
          errors: true,
        },
      });

      const totalAnalyses = analyses.length;
      const averageErrors =
        totalAnalyses > 0
          ? analyses.reduce((sum: number, a: any) => sum + a.totalErrors, 0) /
            totalAnalyses
          : 0;
      const averageProcessingTime =
        totalAnalyses > 0
          ? analyses.reduce(
              (sum: number, a: any) => sum + a.processingTime,
              0
            ) / totalAnalyses
          : 0;

      // Count error categories
      const errorCounts: Record<string, number> = {};
      analyses.forEach((analysis: any) => {
        try {
          const errors = JSON.parse(
            analysis.errors as string
          ) as GrammarError[];
          errors.forEach((error) => {
            const category = error.rule.category.name;
            errorCounts[category] = (errorCounts[category] || 0) + 1;
          });
        } catch (error) {
          console.error("Error parsing stored errors:", error);
        }
      });

      const mostCommonErrors = Object.entries(errorCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalAnalyses,
        averageErrors: Math.round(averageErrors * 100) / 100,
        averageProcessingTime: Math.round(averageProcessingTime),
        mostCommonErrors,
      };
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      throw new Error("Failed to fetch analytics data");
    }
  }
}
