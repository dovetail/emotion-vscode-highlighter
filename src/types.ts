export interface EmotionToken {
  line: number;
  character: number;
  length: number;
  tokenType: string;
}

export interface StyledComponentInfo {
  name: string;
  line: number;
  character: number;
  isStyledComponent: boolean;
}

export interface ImportInfo {
  hasEmotionImport: boolean;
  hasStyledComponentsImport: boolean;
  styledIdentifier: string; // 'styled' by default, but could be aliased
}

export interface AnalysisResult {
  styledComponents: Set<string>;
  importInfo: ImportInfo;
  tokens: EmotionToken[];
}

export interface PerformanceMetrics {
  parseTime: number;
  analysisTime: number;
  tokenizationTime: number;
  totalTime: number;
  typeCheckingTime?: number;
}

// New interfaces for type-based detection
export interface TypeCheckingOptions {
  enabled: boolean;
  detectImportedComponents: boolean;
  cacheTypeResults: boolean;
}

export interface TypeCheckingResult {
  isStyledComponent: boolean;
  confidence: 'high' | 'medium' | 'low';
  detectionMethod: 'ast' | 'type' | 'both' | 'cache';
}

export interface ExtendedAnalysisResult extends AnalysisResult {
  typeCheckingEnabled: boolean;
  typeCheckingStats?: {
    totalChecked: number;
    cacheHits: number;
    cacheMisses: number;
  };
}

export const EMOTION_IMPORT_PATTERNS = [
  "@emotion/styled",
  "styled-components",
] as const;

export const SEMANTIC_TOKEN_TYPES = ["emotionStyledComponent"] as const;
export const SEMANTIC_TOKEN_MODIFIERS = [] as const;

export type SemanticTokenType = (typeof SEMANTIC_TOKEN_TYPES)[number];
export type SemanticTokenModifier = (typeof SEMANTIC_TOKEN_MODIFIERS)[number];
