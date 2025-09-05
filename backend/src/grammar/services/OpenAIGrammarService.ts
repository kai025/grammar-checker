import OpenAI from "openai";
import type {
  GrammarAnalysisRequest,
  GrammarAnalysisResult,
  GrammarError,
} from "../types/grammar.types";

export class OpenAIGrammarService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeText(
    request: GrammarAnalysisRequest
  ): Promise<GrammarAnalysisResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildGrammarPrompt(
        request.text,
        request.language || "en"
      );

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert grammar checker. Analyze text for grammar, spelling, style, and punctuation errors. Return a JSON response with detailed error information.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      // Clean the response to extract JSON
      let cleanResponse = response.trim();

      // Remove any markdown code blocks if present
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      const analysis = JSON.parse(cleanResponse);
      const processingTime = Date.now() - startTime;

      // Transform OpenAI response to our standard format
      const errors: GrammarError[] = (analysis.errors || []).map(
        (error: any, index: number) => ({
          message: error.message || error.description,
          shortMessage: error.shortMessage || error.type,
          offset: error.offset || 0,
          length: error.length || error.text?.length || 1,
          replacements: (error.suggestions || error.replacements || []).map(
            (s: any) => ({
              value: typeof s === "string" ? s : s.value || s.suggestion,
            })
          ),
          rule: {
            id: `OPENAI_${error.type?.toUpperCase() || "GRAMMAR"}_${index}`,
            description:
              error.explanation || error.rule || "Grammar issue detected by AI",
            category: {
              id: error.category?.toUpperCase() || "AI_GRAMMAR",
              name: this.mapCategory(error.category || error.type || "Grammar"),
            },
            issueType: error.type || "grammar",
          },
          sentence: error.sentence || request.text,
          type: {
            typeName: error.severity || "Other",
          },
        })
      );

      return {
        errors,
        totalErrors: errors.length,
        language: request.language || "en",
        processingTime,
        textLength: request.text.length,
      };
    } catch (error) {
      console.error("OpenAI grammar analysis error:", error);
      throw new Error("Failed to analyze grammar with AI");
    }
  }

  private buildGrammarPrompt(text: string, language: string): string {
    return `You are a grammar checker. Analyze the following text for grammar, spelling, style, and punctuation errors in ${
      language === "en" ? "English" : language
    }.

Text to analyze:
"${text}"

IMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON. Use this exact structure:
{
  "errors": [
    {
      "message": "Detailed explanation of the error",
      "shortMessage": "Brief error description", 
      "offset": 0,
      "length": 4,
      "text": "word or phrase with error",
      "suggestions": ["suggestion1", "suggestion2"],
      "type": "grammar|spelling|style|punctuation",
      "category": "Grammar|Spelling|Style|Punctuation|Clarity",
      "severity": "high|medium|low",
      "explanation": "Why this is an error and how to fix it",
      "sentence": "The sentence containing the error"
    }
  ],
  "summary": {
    "totalErrors": 0,
    "grammarErrors": 0,
    "spellingErrors": 0,
    "styleIssues": 0,
    "overallQuality": "excellent|good|fair|needs improvement"
  }
}

Be thorough but accurate. Only flag actual errors, not stylistic preferences unless they significantly impact clarity.`;
  }

  private mapCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      grammar: "Grammar",
      spelling: "Spelling",
      style: "Style",
      punctuation: "Punctuation",
      clarity: "Clarity",
      redundancy: "Redundancy",
      word_choice: "Word Choice",
      sentence_structure: "Sentence Structure",
    };

    return categoryMap[category.toLowerCase()] || "Grammar";
  }
}
