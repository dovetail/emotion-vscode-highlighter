export interface EmotionToken {
  line: number;
  character: number;
  length: number;
  tokenType: string;
}

export interface ImportInfo {
  hasEmotionImport: boolean;
  hasStyledComponentsImport: boolean;
  styledIdentifier: string; // 'styled' by default, but could be aliased
}

// New interfaces for type-based detection
export interface TypeCheckingOptions {
  enabled: boolean;
  detectImportedComponents: boolean;
  cacheTypeResults: boolean;
}

export interface ExtendedAnalysisResult {
  styledComponents: Set<string>;
  importInfo: ImportInfo;
  tokens: EmotionToken[];
  typeCheckingEnabled: boolean;
  typeCheckingStats?: {
    totalChecked: number;
    cacheHits: number;
    cacheMisses: number;
  };
}

export const SEMANTIC_TOKEN_TYPES = ["emotionStyledComponent"] as const;
export const SEMANTIC_TOKEN_MODIFIERS = [] as const;

export type SemanticTokenType = (typeof SEMANTIC_TOKEN_TYPES)[number];
export type SemanticTokenModifier = (typeof SEMANTIC_TOKEN_MODIFIERS)[number];
