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

// Database models
export interface GrammarAnalysisRecord {
  id: string;
  userId?: string;
  text: string;
  language: string;
  totalErrors: number;
  processingTime: number;
  createdAt: Date;
  errors: GrammarError[];
}

export interface LanguageToolResponse {
  software: {
    name: string;
    version: string;
    buildDate: string;
    apiVersion: number;
    premium: boolean;
    premiumHint: string;
    status: string;
  };
  warnings: {
    incompleteResults: boolean;
  };
  language: {
    name: string;
    code: string;
    detectedLanguage: {
      name: string;
      code: string;
      confidence: number;
    };
  };
  matches: LanguageToolMatch[];
}

export interface LanguageToolMatch {
  message: string;
  shortMessage: string;
  replacements: LanguageToolReplacement[];
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  sentence: string;
  type: {
    typeName: string;
  };
  rule: {
    id: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  ignoreForIncompleteSentence: boolean;
  contextForSureMatch: number;
}

export interface LanguageToolReplacement {
  value: string;
  shortDescription?: string;
}
