import { BaseApiService } from "./base";
import type {
  GrammarAnalysisResult,
  GrammarAnalysisRequest,
  GrammarHistoryItem,
} from "../types/grammar";

export class GrammarApiService extends BaseApiService {
  async analyzeGrammar(
    text: string,
    language = "en"
  ): Promise<GrammarAnalysisResult> {
    const request: GrammarAnalysisRequest = {
      text,
      language,
    };

    return this.post<GrammarAnalysisResult>("/api/grammar/analyze", request);
  }

  async getAnalysisHistory(): Promise<GrammarHistoryItem[]> {
    return this.get<GrammarHistoryItem[]>("/api/grammar/history");
  }

  async getAnalytics(): Promise<any> {
    return this.get<any>("/api/grammar/analytics");
  }
}

export const grammarApi = new GrammarApiService();

// Export convenience functions for backward compatibility
export const analyzeGrammar = (text: string, language = "en") =>
  grammarApi.analyzeGrammar(text, language);

export const getAnalysisHistory = () => grammarApi.getAnalysisHistory();
