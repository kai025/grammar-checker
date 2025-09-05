export interface GrammarReplacement {
  value: string;
  shortDescription?: string;
}

export interface GrammarRuleCategory {
  id: string;
  name: string;
}

export interface GrammarRule {
  id: string;
  description: string;
  category: GrammarRuleCategory;
  issueType: string;
}

export interface GrammarError {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: GrammarReplacement[];
  rule: GrammarRule;
  sentence: string;
  type: {
    typeName: string;
  };
}

export interface GrammarAnalysisResult {
  errors: GrammarError[];
  totalErrors: number;
  language: string;
  processingTime: number;
  textLength: number;
}

export interface GrammarAnalysisRequest {
  text: string;
  language?: string;
  userId?: string;
}

export interface GrammarHistoryItem {
  id: string;
  userId?: string;
  text: string;
  language: string;
  totalErrors: number;
  processingTime: number;
  createdAt: string;
  errors: GrammarError[];
}
