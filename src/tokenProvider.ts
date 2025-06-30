import * as vscode from "vscode";
import { EmotionAnalyzer } from "./analyzer";
import { SEMANTIC_TOKEN_MODIFIERS, SEMANTIC_TOKEN_TYPES, ExtendedAnalysisResult } from "./types";

export class EmotionSemanticTokenProvider
  implements vscode.DocumentSemanticTokensProvider
{
  private analyzer: EmotionAnalyzer;
  private tokensBuilder: vscode.SemanticTokensBuilder;

  constructor() {
    vscode.window.showInformationMessage("🚀 CONSTRUCTOR START: EmotionSemanticTokenProvider");
    
    try {
      vscode.window.showInformationMessage("🔨 Step 1: About to create EmotionAnalyzer");
      this.analyzer = new EmotionAnalyzer();
      vscode.window.showInformationMessage("✅ Step 1: EmotionAnalyzer created successfully!");
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Step 1 FAILED: EmotionAnalyzer creation: ${error}`);
      throw error;
    }
    
    try {
      vscode.window.showInformationMessage("🔨 Step 2: About to call this.getLegend()");
      const legend = this.getLegend();
      vscode.window.showInformationMessage("✅ Step 2: getLegend() completed");
      
      vscode.window.showInformationMessage("🔨 Step 3: About to create SemanticTokensBuilder");
      this.tokensBuilder = new vscode.SemanticTokensBuilder(legend);
      vscode.window.showInformationMessage("✅ Step 3: SemanticTokensBuilder created!");
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Step 2-3 FAILED: Tokens builder creation: ${error}`);
      throw error;
    }
    
    vscode.window.showInformationMessage("🎉 CONSTRUCTOR END: EmotionSemanticTokenProvider fully created!");
  }

  public static getLegend(): vscode.SemanticTokensLegend {
    return new vscode.SemanticTokensLegend(
      SEMANTIC_TOKEN_TYPES.slice(),
      SEMANTIC_TOKEN_MODIFIERS.slice()
    );
  }

  public getLegend(): vscode.SemanticTokensLegend {
    return EmotionSemanticTokenProvider.getLegend();
  }

  public async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens> {
    
    // DEBUG: Show when this method is called
    vscode.window.showInformationMessage(`🔍 ANALYZING: ${document.fileName} (${document.languageId})`);
    
    // Check if the extension is enabled
    const config = vscode.workspace.getConfiguration("emotionHighlighter");
    const enabled = config.get("enabled", true);
    vscode.window.showInformationMessage(`⚙️ Extension enabled: ${enabled}`);
    
    if (!enabled) {
      vscode.window.showInformationMessage("❌ Extension is DISABLED in settings");
      return new vscode.SemanticTokens(new Uint32Array(0));
    }

    // Early exit for unsupported file types
    const isSupported = this.isSupportedLanguage(document.languageId);
    vscode.window.showInformationMessage(`📄 Language supported: ${isSupported} (${document.languageId})`);
    
    if (!isSupported) {
      vscode.window.showInformationMessage(`❌ UNSUPPORTED language: ${document.languageId}`);
      return new vscode.SemanticTokens(new Uint32Array(0));
    }

    // Check for cancellation
    vscode.window.showInformationMessage(`🚫 Cancellation requested: ${token.isCancellationRequested}`);
    
    if (token.isCancellationRequested) {
      vscode.window.showInformationMessage("❌ ANALYSIS CANCELED");
      return new vscode.SemanticTokens(new Uint32Array(0));
    }

    try {
      vscode.window.showInformationMessage("🚀 Starting emotion analysis...");
      const analysisResult: ExtendedAnalysisResult = await this.analyzer.analyze(document);

      // Check for cancellation after analysis
      if (token.isCancellationRequested) {
        return new vscode.SemanticTokens(new Uint32Array(0));
      }

      // Build semantic tokens from analysis result
      this.tokensBuilder = new vscode.SemanticTokensBuilder(this.getLegend());

      for (const emotionToken of analysisResult.tokens) {
        this.tokensBuilder.push(
          emotionToken.line,
          emotionToken.character,
          emotionToken.length,
          this.encodeTokenType(emotionToken.tokenType),
          0 // No modifiers for now
        );
      }

      const result = this.tokensBuilder.build();
      
      // Enhanced logging with type checking stats
      if (analysisResult.typeCheckingEnabled && analysisResult.typeCheckingStats) {
        const stats = analysisResult.typeCheckingStats;
        vscode.window.showInformationMessage(
          `✅ ANALYSIS COMPLETE: ${analysisResult.tokens.length} tokens ` +
          `(TypeChecking: ${stats.totalChecked} checked, ${stats.cacheHits} cache hits)`
        );
      } else {
        vscode.window.showInformationMessage(`✅ ANALYSIS COMPLETE: Generated ${analysisResult.tokens.length} tokens`);
      }
      
      return result;
    } catch (error) {
      vscode.window.showInformationMessage(`❌ ANALYSIS ERROR: ${error}`);
      console.error("Error providing semantic tokens:", error);
      return new vscode.SemanticTokens(new Uint32Array(0));
    }
  }

  public async provideDocumentSemanticTokensEdits(
    document: vscode.TextDocument,
    previousResultId: string,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens | vscode.SemanticTokensEdits> {
    // For now, just return full tokens - could be optimized later
    return this.provideDocumentSemanticTokens(document, token);
  }

  private isSupportedLanguage(languageId: string): boolean {
    return [
      "typescript",
      "typescriptreact",
      "javascript",
      "javascriptreact",
    ].includes(languageId);
  }

  private encodeTokenType(tokenType: string): number {
    const index = SEMANTIC_TOKEN_TYPES.indexOf(tokenType as any);
    return index !== -1 ? index : 0;
  }

  public clearAnalyzerCache(): void {
    this.analyzer.clearCache();
  }

  public getAnalyzerCacheSize(): number {
    return this.analyzer.getCacheSize();
  }

  public getAnalyzerTypeCacheSize(): number {
    return this.analyzer.getTypeCacheSize();  
  }
}

export class EmotionDocumentRangeSemanticTokenProvider
  implements vscode.DocumentRangeSemanticTokensProvider
{
  private fullProvider: EmotionSemanticTokenProvider;

  constructor() {
    this.fullProvider = new EmotionSemanticTokenProvider();
  }

  public getLegend(): vscode.SemanticTokensLegend {
    return this.fullProvider.getLegend();
  }

  public async provideDocumentRangeSemanticTokens(
    document: vscode.TextDocument,
    range: vscode.Range,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens> {
    // For now, provide full document tokens - could be optimized to only analyze the range
    return this.fullProvider.provideDocumentSemanticTokens(document, token);
  }
}
